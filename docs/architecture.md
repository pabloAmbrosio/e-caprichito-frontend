# Architecture Rules — E-Caprichito Frontend

## Stack decisions (no negociables)

- **Next.js Pages Router** — NUNCA App Router
- **TypeScript strict** — `strict: true`, `noUncheckedIndexedAccess: true`
- **Yarn** — nunca npm ni npx

---

## Estructura de features

```
src/features/<name>/
  domain/          ← tipos, interfaces de repositorio (sin dependencias externas)
  infrastructure/  ← implementaciones API/socket
  application/     ← casos de uso (reciben repositorio como parámetro, nunca lo importan)
  components/      ← UI específica de la feature
  hooks/           ← conecta todo
  index.ts         ← única superficie pública de la feature
```

**Reglas:**
- Features solo se comunican entre sí a través de su `index.ts`
- Domain types NO dependen de frameworks ni fetch
- La capa `application` recibe el repositorio como parámetro, nunca lo importa directamente
- `/pages` solo coordina — debe ser lo más delgado posible

---

## Estructura de componentes

- **Compound components** → carpeta propia (ej. `Navbar/`) con un archivo por sub-componente + `index.ts`
- **Secciones específicas de página** → inline o como componente local en el archivo de la página. No crear archivos separados para ellas
- **Componentes presentacionales compartidos** → `src/shared/components/`
- **Componentes específicos de feature** → `src/features/<name>/components/`
- **Layouts** → `src/shared/layouts/`

---

## Rendering

| Sección | Regla |
|---|---|
| Catálogo / productos | `getStaticProps` + `revalidate: 60` (ISR) |
| Account dashboard | Client only — sin `getServerSideProps` |
| Cart / checkout / payment | Client only |
| Backoffice | Client only + `ProtectedBackofficeRoute` |

---

## Estilos

- **rem en todas partes** — nunca px en spacings, paddings, font-sizes, gaps
- Excepción: `max-w-[1280px]` para el contenedor principal
- Contenedor estándar: `max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12`
- Mobile-first: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Dark mode: class-based via `@variant dark (&:where(.dark, .dark *))` en `globals.css`

---

## Auth

- JWT en httpOnly cookie — sin NextAuth ni librerías externas
- `useSessionInit` solo en `_app.tsx`
- `useAuth` solo acciones — no gestiona scheduler ni configureAuthFetch
- AuthModal global (Zustand) — sin páginas `/auth/login` ni `/auth/register`
- Solo existe `/auth/callback` para OAuth

---

## Backoffice

- Protegido por `ProtectedBackofficeRoute`: requiere `isAuthenticated` + `adminRole !== 'CUSTOMER'`
- Layout: `BackofficeLayout` con sidebar fijo oscuro
- Sin sidebar mobile (pendiente)

---

## Tipos y utilidades compartidas

### `src/shared/types/enums.ts` — fuente de verdad de todos los enums del sistema

Verificar acá antes de definir un enum nuevo. Enums actuales:

| Enum | Valores |
|---|---|
| `AdminRole` | `OWNER \| ADMIN \| MANAGER \| SELLER \| CUSTOMER` |
| `CustomerRole` | `MEMBER \| VIP_FAN \| VIP_LOVER \| VIP_LEGEND` |
| `OrderStatus` | `PENDING \| CONFIRMED \| SHIPPED \| DELIVERED \| CANCELLED` |
| `DeliveryType` | `PICKUP \| HOME_DELIVERY \| SHIPPING` |
| `ShipmentStatus` | `PENDING \| PREPARING \| READY_FOR_PICKUP \| SHIPPED \| IN_TRANSIT \| OUT_FOR_DELIVERY \| DELIVERED \| FAILED` |
| `PaymentStatus` | `PENDING \| AWAITING_REVIEW \| APPROVED \| REJECTED \| REFUNDED \| EXPIRED \| CANCELLED` |
| `PaymentMethod` | `MANUAL_TRANSFER \| CASH_ON_DELIVERY` |
| `ProductStatus` | `DRAFT \| PUBLISHED \| ARCHIVED` |
| `RuleOperator` | `ALL \| ANY` |
| `RuleType` | `PRODUCT \| CATEGORY \| TAG \| CART_MIN_TOTAL \| CART_MIN_QUANTITY \| CUSTOMER_ROLE \| FIRST_PURCHASE` |
| `ActionType` | `PERCENTAGE_DISCOUNT \| FIXED_DISCOUNT \| BUY_X_GET_Y` |
| `ActionTarget` | `PRODUCT \| CART \| CHEAPEST_ITEM` |

> `DeliveryStatus` está deprecado — usar `ShipmentStatus`.

### `src/shared/types/api.ts` — tipos genéricos de respuesta API

`ApiSuccess<T>`, `PaginatedResponse<T>`, `ApiError` — usar estos en lugar de definir respuestas ad-hoc.

### `src/shared/utils/`

| Archivo | Uso |
|---|---|
| `cn.ts` | `clsx` + `tailwind-merge` — usar siempre para combinar clases |
| `apiConfig.ts` | Configuración base de la API |
| `apiError.ts` | Manejo de errores de API |
| `nativeNotification.ts` | Notificaciones nativas del navegador |

### `src/shared/hooks/`

| Hook | Uso |
|---|---|
| `useTheme` | Leer/cambiar tema |
| `useMaintenanceRedirect` | Redirige a `/maintenance` si el backend lo indica |
| `usePageViewTransition` | Transiciones entre páginas |
