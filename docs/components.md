# Component Map — E-Caprichito Frontend

Inventario de componentes, hooks y stores del proyecto.
Consultar antes de crear uno nuevo o modificar uno existente.

---

## Layouts

| Componente | Path | Props clave |
|---|---|---|
| `TiendaLayout` | `src/shared/layouts/TiendaLayout.tsx` | `showTopbar`, `categoryLinks?`, `showFooter` |
| `AccountLayout` | `src/shared/layouts/AccountLayout.tsx` | `title`, `children`, `categoryLinks?` — wrappea TiendaLayout sin topbar |
| `BackofficeLayout` | `src/shared/layouts/BackofficeLayout.tsx` | Sidebar fijo oscuro. Llama `useStaffSocket` y listeners globales de toast |

---

## Shared Components

| Componente | Path | Notas |
|---|---|---|
| `Navbar/` | `src/shared/components/Navbar/` | Compound. Sub-componentes: Logo, Search, Actions, CartButton, ActionButton, UserAvatar, MobileMenu, CategoryBar. Prop: `categoryLinks?` |
| `NavbarUserAvatar` | `src/shared/components/Navbar/NavbarUserAvatar.tsx` | Círculo gradiente turquoise con inicial. Props: `username`, `href?` |
| `Footer` | `src/shared/components/Footer.tsx` | Grid 4 columnas, dark |
| `Topbar` | `src/shared/components/Topbar.tsx` | Barra promo pink, contenido estático |
| `SectionHeader` | `src/shared/components/SectionHeader.tsx` | Título con barra de color + link "Ver todas" |
| `HeroGrid/` | `src/shared/components/HeroGrid/` | Compound: HeroBanner (Embla carousel) + HeroPromoCard. Props: `slides: HeroBannerSlide[]`, `promoCards: HeroPromoCardData[]` |
| `PromoBar` | `src/shared/components/PromoBar.tsx` | Banner gradiente yellow/orange — hardcoded |
| `BannerTrio` | `src/shared/components/BannerTrio.tsx` | 3 banners link. Prop: `banners[]` |
| `ThemeToggle` | `src/shared/components/ThemeToggle.tsx` | Light/dark. En NavbarActions (desktop) y NavbarMobileMenu footer (mobile) |
| `WhatsAppFab` | `src/shared/components/WhatsAppFab.tsx` | FAB fixed bottom-right. Lee `NEXT_PUBLIC_WHATSAPP_NUMBER`. Montado en `_app.tsx` |
| `NotificationToast` | `src/shared/components/NotificationToast.tsx` | Toasts flotantes. Montado en `_app.tsx`. Lee `notificationStore` |
| `BackofficePagination` | `src/shared/components/BackofficePagination.tsx` | Paginación compartida para todas las tablas del backoffice |
| `ProductsSectionList` | `src/shared/components/ProductsSectionList.tsx` | Lista de múltiples `ProductsSection` — distinto a `ProductsSection` individual |
| `FlyToCartDot` | `src/shared/components/FlyToCartDot.tsx` | Animación visual "fly to cart". Usa `flyToCartStore` |
| `ErrorBoundary` | `src/shared/components/ErrorBoundary.tsx` | Boundary de errores React |
| `ErrorPageShell/` | `src/shared/components/ErrorPageShell/` | Shell visual para páginas 404/500/error |

---

## Feature: products

| Componente | Path | Notas |
|---|---|---|
| `ProductCard` | `src/features/products/components/ProductCard.tsx` | Props: `product: ProductCardData`, `onAddToCart?`, `isAdding?`, `isSuccess?`. Ribbon 3D top-right, like button bottom-right (solo autenticados), 3 estados CTA. Sin `overflow-hidden` en el card exterior |
| `CategoryItem` | `src/features/products/components/CategoryItem.tsx` | Círculo con imagen o fallback gradiente. Props: `CategoryItemData`, `size?: 'md'(96px) \| 'lg'(112px)` |
| `CategoryRow` | `src/features/products/components/CategoryRow.tsx` | Row scrollable de subcategorías. Props: `categories: CategoryItemData[]`, `size?`, `limit?` |
| `ProductsSection` | `src/features/products/components/ProductsSection.tsx` | Scroll horizontal mobile / grid desktop (4 cols lg, 5 xl). Integra `useAddToCart`. Props: `title`, `viewAllHref`, `products: ProductCardData[]` |
| `ProductsPage/` | `src/features/products/components/ProductsPage/` | Compound: filtros + grid + sort + infinite scroll. Props: `initialProducts`, `initialTotal`, `categoryTree` |
| `ProductDetail/` | `src/features/products/components/ProductDetail/` | Compound: `ProductDetail`, `ProductGallery`, `ProductHead`, `ProductInfo`, `ProductVariantSelector`, `ProductVariantDetails` |
| `CategoryPage/` | `src/features/products/components/CategoryPage/` | Compound: `CategoryPage`, `CategoryPageHeader`, `SubcategoryChips` |

---

## Feature: auth

| Componente | Path | Notas |
|---|---|---|
| `AuthModal/` | `src/features/auth/components/AuthModal/` | Compound: container + StepIdentifier + StepPassword + StepRegister. Controlado por `authModalStore`. Desktop: drawer derecho. Mobile: modal centrado |
| `GoogleOAuthButton` | `src/features/auth/components/GoogleOAuthButton.tsx` | Botón outlined con SVG Google, hover turquoise |
| `ProtectedBackofficeRoute` | `src/features/auth/components/ProtectedBackofficeRoute.tsx` | Requiere `isAuthenticated` + `adminRole !== 'CUSTOMER'` |
| `ProtectedRoute` | `src/features/auth/guards/ProtectedRoute.tsx` | Guard para rutas de cuenta — redirige a AuthModal si no autenticado |

---

## Feature: users

> Contiene tanto componentes de cuenta del cliente como hooks de backoffice de usuarios.

| Componente | Path | Notas |
|---|---|---|
| `AccountDashboard/` | `src/features/users/components/AccountDashboard/` | Sub-componentes: `AccountLastOrder`, `AccountStats` |
| `AccountProfile/` | `src/features/users/components/AccountProfile/` | Sub-componentes: `AddPhoneForm`, `PhoneVerificationAlert`, `ProfileField`, `ProfileHeader`, `ProfileReadOnlyNotice` |

---

## Feature: cart

| Componente | Path | Notas |
|---|---|---|
| `CartDrawer/` | `src/features/cart/components/CartDrawer/` | Compound: CartDrawer + CartDrawerItem. Drawer derecho "Noche Caribeña". Dual-store, auth reminder banner. Montado en `_app.tsx` |
| `CartPage/` | `src/features/cart/components/CartPage/` | Grid 2 col (items + summary). Clickable thumbnails → `/product/${slug}`. Stepper + remove. Guest: AuthModal en checkout |
| `BackofficeCart/` | `src/features/cart/components/BackofficeCart/` | Compound para backoffice: `AbandonedCartsTable`, `ActiveCartsTable`, `CarritosSearchBar`, `CarritosTabBar`, `CartDangerZone`, `CartDetailHeader`, `CartItemsList`, `CartsPagination`, `InactiveDaysFilter` |

---

## Feature: orders

| Componente | Path | Notas |
|---|---|---|
| `CheckoutPage/` | `src/features/orders/components/Checkout/` | 2 pasos: StepDelivery (3 tipos + AddressSelect) + StepConfirm (resumen + confirm CTA → `/payment/${orderId}`) |
| `PaymentPage/` | `src/features/orders/components/PaymentPage/` | Sub-componentes: CountdownTimer, BankDetailsCard, PaymentStatusBanner. WebSocket `pago:confirmado` → auto-redirect. 3 vistas: activo / awaiting-review / estados error |
| `MyOrders/` | `src/features/orders/components/MyOrders/` | Sub-componentes: `OrderItem`, `OrdersEmptyState`, `OrdersPagination` |

---

## Feature: payments

| Componente | Path | Notas |
|---|---|---|
| `ProofUploadZone` | `src/features/payments/components/ProofUploadZone.tsx` | Drag-and-drop. Preview, validación JPG/PNG/WebP ≤10MB. Acepta bank reference input. Usado en PaymentPage y account/orders/[id] |

---

## Feature: addresses

| Componente | Path | Notas |
|---|---|---|
| `AddressCard` | `src/features/addresses/components/AddressCard.tsx` | Seleccionable con radio, label, dirección, badge default, edit/delete |
| `AddressForm` | `src/features/addresses/components/AddressForm.tsx` | Label + AddressAutocomplete + details. Reutilizable create/edit |
| `AddressSelect` | `src/features/addresses/components/AddressSelect.tsx` | Lista seleccionable con fee + warning disponibilidad + inline "agregar dirección" |
| `AddressAutocomplete` | `src/features/addresses/components/AddressAutocomplete.tsx` | Google Maps Places. Retorna `{ formattedAddress, lat, lng }` |

---

## Hooks globales (solo en `_app.tsx`)

| Hook | Responsabilidad |
|---|---|
| `useSessionInit` | Restaurar sesión, configurar `authFetch`, gestionar `TokenRefreshScheduler` |
| `useCartInit` | Hidratar `guestCartStore` desde localStorage, merge guest→auth al login |
| `useLikedInit` | Hidratar `likedStore` al login, limpiar al logout |
| `useTheme` | Inicializar tema desde localStorage / `prefers-color-scheme` |

---

## Stores Zustand

| Store | Path | Estado principal |
|---|---|---|
| `authStore` | `src/features/auth/store/` | `accessToken`, `isAuthenticated`, usuario |
| `authModalStore` | `src/features/auth/store/authModalStore.ts` | `isOpen`, `open()`, `close()` |
| `cartStore` | `src/features/cart/store/cartStore.ts` | `cart: CartWithPromotions \| null`, `isDrawerOpen` |
| `guestCartStore` | `src/features/cart/store/guestCartStore.ts` | `items: GuestCartItem[]` — persiste localStorage |
| `likedStore` | `src/features/products/store/likedStore.ts` | `ids: Set<string>` |
| `flyToCartStore` | `src/shared/store/flyToCartStore.ts` | Estado de la animación fly-to-cart |
| `themeStore` | `src/shared/store/themeStore.ts` | `theme: 'light' \| 'dark'` |
| `notificationStore` | `src/shared/store/notificationStore.ts` | `AppNotification[]`, auto-dismiss 6s |

---

## Backoffice — componentes por módulo

### Dashboard
| Componente | Path |
|---|---|
| `BackofficeDashboard` | `src/features/dashboard/components/BackofficeDashboard.tsx` |

### Productos / Categorías
| Componente | Path |
|---|---|
| `CategoryForm` | `src/features/products/components/BackofficeCategory/CategoryForm.tsx` |
| `ProductForm` | `src/features/products/components/BackofficeProduct/ProductForm.tsx` |
| `VariantFieldArray` | `src/features/products/components/BackofficeProduct/VariantFieldArray.tsx` |
| `KeyValueInput` | `src/features/products/components/BackofficeProduct/KeyValueInput.tsx` |

### Promociones
| Componente | Path |
|---|---|
| `PromotionRulesSection` | `src/features/promotions/components/BackofficePromotion/PromotionRulesSection.tsx` |
| `PromotionActionsSection` | `src/features/promotions/components/BackofficePromotion/PromotionActionsSection.tsx` |

### Carritos
| Componente | Path |
|---|---|
| `BackofficeCart/` | `src/features/cart/components/BackofficeCart/` |

### Envíos
| Componente | Path |
|---|---|
| `BackofficeShipmentsFilters` | `src/features/orders/components/BackofficeShipment/BackofficeShipmentsFilters.tsx` |
| `BackofficeShipmentsTable` | `src/features/orders/components/BackofficeShipment/BackofficeShipmentsTable.tsx` |

---

## Backoffice — hooks por módulo

| Hook | Feature | Descripción |
|---|---|---|
| `useBackofficeDashboard` | dashboard | 3 fetches paralelos: pagos AWAITING_REVIEW, envíos activos, órdenes PENDING |
| `useBackofficeCategories` | products | CRUD categorías |
| `useBackofficeProducts` | products | `listProducts` con filtros |
| `useBackofficeProductDetail` | products | create/get/update/status/variants |
| `useBackofficeOrders` | orders | Lista con filtros (page, status, fechas, nombres) |
| `useBackofficeOrderDetail` | orders | get + cancel. Estado es read-only (automático) |
| `useBackofficePayments` | payments | Lista con filtros por status |
| `useBackofficePaymentDetail` | payments | get + review (APPROVE/REJECT) |
| `useBackofficeShipments` | orders | Lista con filtros por status y tipo |
| `useBackofficeShipmentDetail` | orders | get + advance + fail |
| `useBackofficeUsers` | users | Lista con filtros + soft delete/restore |
| `useBackofficeUserDetail` | users | get + create + update + delete + restore |
| `useBackofficeInventory` | inventory | Lista + asignar stock |
| `useBackofficePromotions` | promotions | Lista + delete |
| `useBackofficePromotionDetail` | promotions | create + get + update + rules + actions |
| `useUploadProof` | payments | Firma → Cloudinary → secure_url |
| `useUploadPromotionImage` | promotions | Firma → Cloudinary → secure_url (landscape 1600×900) |
| `useProductsPage` | products | Filtros + URL sync + infinite scroll + 2 queries paralelas |
| `useBackofficeCartList` | cart | Lista carritos activos y abandonados con filtros |

---

## Rutas del backoffice

```
/backoffice                        dashboard
/backoffice/orders                 lista
/backoffice/orders/[id]            detalle + cancelar
/backoffice/payments               lista
/backoffice/payments/[id]          detalle + aprobar/rechazar
/backoffice/shipments              lista
/backoffice/shipments/[id]         detalle + avanzar/fallar
/backoffice/users                  lista
/backoffice/users/new              crear admin
/backoffice/users/[id]             editar + roles + delete/restore
/backoffice/inventory              lista + asignar stock
/backoffice/promotions             lista
/backoffice/promotions/new         crear
/backoffice/promotions/[id]        editar + rules + actions
/backoffice/categories             lista
/backoffice/categories/new         crear
/backoffice/categories/[id]        editar/eliminar
/backoffice/products               lista
/backoffice/products/new           crear
/backoffice/products/[id]          editar
/backoffice/carts                  lista (activos + abandonados)
/backoffice/carts/[id]             detalle + danger zone
```
