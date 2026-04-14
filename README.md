# E-Caprichito — Frontend

Frontend del e-commerce de El Caprichito, un local que ya opera de forma presencial y que está dando el salto a venta online. No es un proyecto de ejemplo: va a producción, con clientes reales y plata real de por medio.

Lo hice solo, de cero, y lo uso también como el proyecto donde me doy el lujo de practicar arquitectura y patrones que no cabían en trabajos anteriores.

El backend vive en un repo aparte: [pabloAmbrosio/e-caprichito-backend](https://github.com/pabloAmbrosio/e-caprichito-backend).

## Qué hace

Dos aplicaciones en el mismo Next: la tienda pública y el backoffice operativo.

**Tienda (cliente final):**
- Catálogo con ISR, categorías dinámicas, producto abstracto → variantes con galería
- Carrito con doble store: `guestCartStore` (localStorage, usuarios anónimos) y `cartStore` (autenticados, con promociones del backend). Merge automático guest → auth al loguearse
- Checkout multi-step con 3 tipos de entrega (pickup, domicilio, envío) y autocomplete de Google Maps
- Pago manual con comprobante: countdown, datos bancarios, upload, confirmación por socket
- Likes con optimistic update y rollback en fallo
- Auth con JWT en cookie httpOnly (sin NextAuth)

**Backoffice (staff):**
- Módulos de órdenes, pagos, usuarios, inventario, promociones, categorías y productos
- Notificaciones realtime (socket autenticado con JWT) para pagos subidos y órdenes nuevas
- Dashboard de contadores con flujo paso a paso
- Máquina de estados de envíos centralizada (PICKUP / HOME_DELIVERY / SHIPPING + FAILED)

## Stack

- Next 16 (Pages Router) + React 19
- TypeScript strict
- Tailwind CSS 4
- Zustand para estado global
- socket.io-client para realtime
- Google Maps JS API para autocomplete de direcciones
- Embla Carousel para el hero
- `clsx` + `tailwind-merge` vía helper `cn()`

## Arquitectura

Organización por feature bajo `src/features/<name>/`, cada una con las mismas capas:

```
domain/          tipos, interfaces de repositorio, constantes de dominio
infrastructure/  implementaciones HTTP (llamadas a la API)
application/     casos de uso que orquestan dominio + infra
components/      UI de la feature
hooks/           punto donde se conecta todo para la UI
index.ts         solo exporta lo público
```

La filosofía: cada feature es un sistema pequeño con fronteras claras. Una feature no importa los internals de otra — solo lo que expone su `index.ts`. Los totales de dinero nunca se calculan en el cliente (vienen del backend en centavos). El estado de las órdenes es derivado, no manual.

Hay documentación detallada en [CLAUDE.md](./CLAUDE.md) y en [docs/](./docs/): arquitectura, mapa de componentes y design system.

## Correrlo local

Necesitas Node 20+, yarn, y el [backend](https://github.com/pabloAmbrosio/e-caprichito-backend) corriendo (por defecto en `http://localhost:3000`).

```bash
# 1. instalar dependencias
yarn install

# 2. configurar variables de entorno
cp .env.example .env.local    # y rellenar los valores
```

Variables mínimas:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=521XXXXXXXXXX
```

```bash
# 3. arrancar en dev (puerto 5173)
yarn dev
```

El frontend queda en http://localhost:5173.

## Scripts

```bash
yarn dev            # Next en modo dev (puerto 5173)
yarn build          # build de producción
yarn start          # servir el build
yarn lint           # ESLint
yarn tsc --noEmit   # type check
```

## Package manager

Siempre `yarn`. Nunca `npm` ni `npx`.

## Sobre el uso de IA

Uso Claude Code como parte de mi flujo — principalmente para acelerar la escritura repetitiva, explorar opciones de diseño y revisar código mío. Las decisiones de arquitectura, los tradeoffs y los patrones son míos; la IA es un acelerador, no un autor. Me pareció honesto mencionarlo.

## Estado

En desarrollo activo. Lo que está en main compila y el flujo end-to-end (catálogo → carrito → checkout → pago → order) funciona contra el backend.

Áreas pendientes conocidas:
- Tests automatizados (no hay suite aún)
- View Transitions hero card → galería implementadas pero deshabilitadas
- Imágenes servidas desde el backend local; migración a CDN (Cloudinary) pendiente
- Descuentos por ítem en el carrito (hoy solo se muestra el `totalDiscount` agregado)
- i18n no implementado (strings en español)

Para dudas o comentarios, pueden abrir un issue o contactarme directamente.
