# Design System — E-Caprichito

## Identidad visual

**Light:** "Mercado Bajo el Sol" — vibrante, tropical, cálido  
**Dark:** "Noche Caribeña" — oscuro profundo con acentos de marca constantes

---

## Colores de marca (invariables entre modos)

| Token | Hex | Uso |
|---|---|---|
| `turquoise` | `#00C5D4` | Interactivos primarios, focus rings, bordes |
| `turquoise-dark` | `#009BAB` | Gradiente end en botones turquoise |
| `pink` | `#F0177A` | Carrito, badges, CTA, sale |
| `yellow` | `#FFD600` | Chips destacados, promo badges |
| `orange` | `#FF7A00` | Logo subtítulo, acentos secundarios |
| `text-dark` | `#1A1A2E` | Texto body/headings (solo light) |
| `text-mid` | `#555577` | Subtítulos, labels (solo light) |
| `bg-light` | `#F0FEFF` | Fondo de página (solo light) |

---

## Tokens semánticos (adaptan entre modos)

Usar **siempre** estos en lugar de colores hardcodeados para superficies, texto y bordes:

| Token CSS | Tailwind | Light | Dark |
|---|---|---|---|
| `--surface` | `bg-surface` | `#FFFFFF` | `#0D0D1A` |
| `--surface-raised` | `bg-surface-raised` | `#F0FEFF` | `#1A1A2E` |
| `--surface-overlay` | `bg-surface-overlay` | `#F5F5F8` | `#1E1E35` |
| `--on-surface` | `text-on-surface` | `#1A1A2E` | `#F0F0FF` |
| `--on-surface-muted` | `text-on-surface-muted` | `#555577` | `#9999BB` |
| `--stroke` | `border-stroke` | `#E0E0EC` | `#2A2A45` |

**Excepciones que NO usan tokens semánticos:**
- Componentes con gradient propio (PromoBar, BannerTrio, HeroPromoCard, Footer) — theme-agnostic
- El mobile drawer siempre es `#1A1A2E` independiente del tema

---

## Gradientes de marca

```css
/* Navbar stripe / accent horizontal */
linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)

/* Logo, hero, diagonal */
linear-gradient(135deg, #00C5D4, #F0177A)

/* CTA botones pink */
linear-gradient(135deg, #F0177A, #C0005A)

/* Botones turquoise */
linear-gradient(135deg, #00C5D4, #009BAB)
```

---

## Tipografía

- **Pacifico** — solo display/logo (Google Fonts en `_document.tsx`)
- **Nunito** — todo lo demás (400, 600, 700, 800, 900)

---

## Sombras

| Token | Valor | Uso |
|---|---|---|
| `shadow-card` | `0 4px 20px rgba(0,0,0,0.09)` | Cards, CategoryItem |
| `shadow-header` | `0 2px 12px rgba(0,197,212,0.12)` | Navbar |
| `shadow-lg` | `0 10px 40px rgba(0,0,0,0.14)` | Modals, drawers |

Dark mode — sombras via CSS variables (no `@theme`):
- `--shadow-surface-card`: `rgba(0,0,0,0.35)` en dark
- `--shadow-surface-header`: opacidad reducida en dark

---

## Patrones de interacción

| Patrón | Clases |
|---|---|
| Hover acción general | `hover:bg-turquoise/10 hover:text-turquoise` |
| Hover carrito/CTA | `hover:bg-pink/10 hover:text-pink` |
| Hover icono | `group-hover:scale-110 group-hover:-translate-y-px` |
| Focus visible | `focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none` |
| Focus search glow | `focus-within:shadow-[0_0_0_0.25rem_rgba(0,197,212,0.12)]` |
| CTA button hover | `hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.4)] hover:scale-[1.03]` |
| Easing drawers | `ease-[cubic-bezier(0.16,1,0.3,1)]` |

---

## Patrones de componentes

**Cards:**
```
bg-surface rounded-2xl border border-stroke
hover:border-turquoise/30 hover:shadow-[0_0_0_3px_rgba(0,197,212,0.06)]
```

**Error alerts:**
```
bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 text-pink
```

**Skeletons:**
```
animate-pulse rounded-xl bg-surface-overlay
```

**Status badges:**
```
rounded-full px-2.5 py-0.5 text-xs font-bold
```

**Botón CTA primario (pink):**
```
linear-gradient(135deg, #F0177A, #C0005A) + hover:scale-[1.02] hover:shadow-[...]
```

**Section header con acento:**
```
w-1 h-4 rounded-full + brand gradient (barra vertical izquierda)
```

**Toggle switches:**
```
background: isOn ? '#00C5D4' : 'rgba(255,255,255,0.1)' + span interno con transform
```

---

## Mobile Drawer — "Noche Caribeña"

Siempre oscuro (`#1A1A2E`) independiente del tema.

```
Overlay:  fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm z-[60]
Drawer:   fixed top-0 right-0 h-full w-[min(20rem,85vw)] bg-[#1A1A2E] z-[70]
          translate-x-full → translate-x-0, 300ms cubic-bezier(0.16,1,0.3,1)
Links:    text-white/70 hover:text-white hover:bg-white/8
          active: bg-white/10 text-white
```

**Z-index layering:**
- Navbar: `z-50`
- Overlay: `z-[60]`
- Drawer: `z-[70]`
- AuthModal: `z-[80]` (modal) / `z-[90]` (drawer)
- Notifications: `z-[100]`

---

## Accesibilidad (obligatorio)

- SVG icons: `aria-hidden="true"`
- Touch targets: mínimo `min-w-[2.75rem] min-h-[2.75rem]`
- Mobile menu: `role="dialog" aria-modal="true"` + focus trap + Escape
- Link activo: `aria-current="page"`
- Search: `role="search"` + `<label>` con `sr-only`
- Navbar: `<nav aria-label="Navegación principal">`

---

## Backoffice — patrones específicos

- Tablas: `rounded-2xl border bg-surface`, header `text-xs font-extrabold uppercase tracking-wider`
- Row hover: `hover:bg-[rgba(0,197,212,0.02)]`
- Sidebar activo: `shadow-[inset_3px_0_0_0_#00C5D4]`
- Filas eliminadas: `opacity-60 bg-[rgba(240,23,122,0.025)]`
- Valores monetarios: centavos del backend ÷ 100 para display en MXN. **Nunca calcular totales client-side**
- Delete confirmación inline: texto cambia a ✓/✕ en el mismo row (no modal)
- Image upload zones: `border-2 border-dashed hover:border-turquoise/40`
