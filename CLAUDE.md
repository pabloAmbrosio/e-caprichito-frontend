# E-Caprichito Frontend

Documentación de arquitectura y convenciones del frontend.

## Documentación relacionada

- [Arquitectura](./docs/architecture.md) — reglas de stack, estructura de features, rendering, auth, tipos compartidos.
- [Mapa de componentes](./docs/components.md) — inventario de componentes, hooks, stores y rutas del backoffice.
- [Design system](./docs/design.md) — identidad visual, tokens, gradientes, patrones de interacción.

---

## Tech Stack

| Capa | Herramienta |
|---|---|
| Framework | Next.js (Pages Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS |
| Estado global | Zustand |
| Sockets | socket.io-client |
| Auth | JWT propio en cookie httpOnly |
| Utilidad CSS | `clsx` + `tailwind-merge` vía `cn()` |

---

## Package Manager

Siempre `yarn`. Nunca `npm` ni `npx`.

```bash
yarn                # instalar dependencias
yarn add <pkg>
yarn add -D <pkg>
yarn dev / build / start / lint
yarn tsc --noEmit
```

---

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=521XXXXXXXXXX
```

---

## Convenciones de naming

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase + `use` | `useProducts.ts` |
| Domain | PascalCase | `Product.ts`, `OrderRepository.ts` |
| Utilidades | camelCase | `formatPrice.ts` |
| Zustand stores | camelCase + `Store` | `cartStore.ts` |
| Infra | camelCase + `Api` / `Socket` | `orderApi.ts` |
| Rutas | siempre en inglés | `/cart`, `/account/orders` |

---

## Estrategia de rendering

| Sección | Estrategia |
|---|---|
| Catálogo / productos | `getStaticProps` + `revalidate` (ISR) |
| Account dashboard | Client only — hooks, sin `getServerSideProps` |
| Cart / checkout / payment | Client only |

---

## Auth — reglas críticas

- Sesión global: `useSessionInit` — solo en `_app.tsx`.
- `useAuth` solo orquesta acciones (login, logout, register, etc.).
- JWT en cookie httpOnly — sin NextAuth ni librerías externas.
- Redirección post-login/register: el componente que llama al hook hace el `router.push`.
- `logout()` limpia el store y redirige a `/auth/login`.

---

## Feature Map

| Feature | Path | Scope |
|---|---|---|
| auth | `src/features/auth/` | Login, JWT, sesión |
| products | `src/features/products/` | Catálogo, categorías, variantes |
| cart | `src/features/cart/` | Carrito, cupones |
| orders | `src/features/orders/` | Órdenes, tracking, checkout, pagos |
| payments | `src/features/payments/` | Transferencia manual, comprobantes |
| addresses | `src/features/addresses/` | CRUD direcciones, Google Maps, checkout |
| users | `src/features/users/` | Solo backoffice |
| inventory | `src/features/inventory/` | Solo backoffice |
| promotions | `src/features/promotions/` | Backoffice + banners públicos |
| dashboard | `src/features/dashboard/` | Contadores + flujo paso a paso |

---

## Cómo agregar una nueva feature

1. Crear `src/features/<name>/` con: `domain/`, `infrastructure/`, `application/`, `components/`, `hooks/`.
2. Tipo principal en `domain/`.
3. Interfaz del repositorio en `domain/`.
4. Implementación en `infrastructure/`.
5. Casos de uso en `application/`.
6. Componentes en `components/`.
7. Hooks en `hooks/` — aquí se conecta todo.
8. Solo exportar items públicos desde `index.ts`.
9. Agregar ruta en `/pages/` si aplica.
10. No modificar otras features existentes.

---

## Sockets activos

| Socket | Evento | Dónde |
|---|---|---|
| Customer | `pago:confirmado` | `PaymentPage` — auto-redirect a order detail |
| Staff | `payment:proof-uploaded` | `BackofficeLayout` — toast global |
| Staff | `order:created` | `BackofficeLayout` — toast global |

- Customer socket: `withCredentials: true`.
- Staff socket: `auth: { token }` — JWT explícito.
- Hook de ciclo de vida: `useStaffSocket` — conecta cuando hay `accessToken` y rol no es `CUSTOMER`.

---

## Lógica de negocio crítica

**Órdenes:**
- El estado de la orden es automático (pago APPROVED → CONFIRMED, envío avanza → SHIPPED, etc.).
- La única acción manual del staff es CANCELAR.
- Totales siempre desde el backend (centavos ÷ 100). Nunca calcular client-side.

**Envíos — máquina de estados:**
- Fuente de verdad: `SHIPMENT_CHAINS` en `src/features/orders/domain/orderStatusMappings.ts`.
- Nunca definir cadenas locales en componentes — siempre importar desde ahí.
- PICKUP: `PENDING → PREPARING → READY_FOR_PICKUP → DELIVERED`.
- HOME_DELIVERY: `PENDING → PREPARING → OUT_FOR_DELIVERY → DELIVERED`.
- SHIPPING: `PENDING → PREPARING → SHIPPED → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED`.
- Desde cualquier estado: `* → FAILED` (nota obligatoria).

**Pagos:**
- `AWAITING_REVIEW` = comprobante subido, requiere revisión.
- APPROVE (nota opcional) | REJECT (nota requerida).

**Carrito — dos stores:**
- `cartStore`: usuarios autenticados, datos del backend con promociones.
- `guestCartStore`: usuarios anónimos, persiste en localStorage.
- Al login: merge de guest → auth vía `addItemsBulk`.

**Likes:**
- `useLikedStore`: `Set` de IDs, hidratado al login, limpiado al logout.
- `useLikeToggle`: optimistic update, revierte en fallo.

**Categorías dinámicas:**
- Vienen de la API en `getStaticProps` (ISR 60s).
- `mapCategoriesToNavLinks()` convierte `Category` → `CategoryLink` para el navbar.
