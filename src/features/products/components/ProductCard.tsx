import Link from 'next/link';
import { useAuthStore } from '@/features/auth';
import { useFlyToCartStore } from '@/shared/store/flyToCartStore';
import { useLikeToggle } from '../hooks/useLikeToggle';
import type { ProductCardData } from '../application/mapProductsToCardData';
import type { AddToCartProduct } from '@/features/cart/hooks/useAddToCart';

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (product: AddToCartProduct) => void;
  isAdding?: boolean;
  isSuccess?: boolean;
}

function formatPrice(value: number): string {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });
}

function PriceRange({ min, max, className }: { min: number; max: number; className?: string }) {
  if (min === max) {
    return <span className={className}>{formatPrice(min)}</span>;
  }
  return (
    <span className={className}>
      {formatPrice(min)}
      <span className="font-semibold text-[0.6875rem] mx-0.5">–</span>
      {formatPrice(max)}
    </span>
  );
}

function PriceDisplay({ priceMin, priceMax, promoPriceMin, promoPriceMax }: {
  priceMin: number;
  priceMax: number;
  promoPriceMin: number | null;
  promoPriceMax: number | null;
}) {
  // Sin promo → precio normal
  if (promoPriceMin == null || promoPriceMax == null) {
    return <PriceRange min={priceMin} max={priceMax} className="text-sm font-black text-pink" />;
  }

  // Con promo → precio con descuento + original tachado
  return (
    <span className="flex items-baseline gap-1.5 flex-wrap">
      <PriceRange min={promoPriceMin} max={promoPriceMax} className="text-sm font-black text-pink" />
      <PriceRange min={priceMin} max={priceMax} className="text-[0.625rem] font-semibold text-on-surface-muted line-through" />
    </span>
  );
}

/** Oscurece un color hex por un factor (0–1). factor=0.7 → 30% más oscuro */
function darkenHex(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = Math.round(parseInt(h.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductCard({ product, onAddToCart, isAdding, isSuccess }: ProductCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLiked, toggle, isToggling } = useLikeToggle(product.id);
  const isOutOfStock = !product.inStock;

  return (
    <div className="bg-surface rounded-xl shadow-[var(--shadow-surface-card)] group/card flex flex-col relative">
      {/* ── Ribbon 3D — esquina superior derecha (fuera del overflow-hidden de la imagen) ── */}
      {(() => {
        const ribbonText = product.promoBadge ?? product.badge;
        const ribbonColor = product.promoBadgeColor ?? product.badgeColor ?? '#F0177A';
        if (!ribbonText || isOutOfStock) return null;
        const foldColor = darkenHex(ribbonColor, 0.5);
        return (
          <div
            className="product-ribbon absolute -top-[0.5rem] -right-[0.5rem] z-20 h-[9.75rem] w-[9.75rem] overflow-hidden pointer-events-none"
            style={{ '--ribbon-fold': foldColor } as React.CSSProperties}
            aria-hidden="true"
          >
            <div
              className="absolute left-[10px] -top-[31px] w-[14.625rem] origin-left rotate-45 py-[0.65rem] text-center text-white text-[0.8125rem] font-black uppercase tracking-wider leading-none"
              style={{
                background: `linear-gradient(135deg, ${ribbonColor}, ${darkenHex(ribbonColor, 0.8)}, ${ribbonColor})`,
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
              }}
            >
              {ribbonText}
            </div>
          </div>
        );
      })()}

      <Link
        href={`/product/${product.slug}`}
        className="no-underline text-on-surface flex flex-col flex-1 outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        {/* ── Image area ── */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-surface-overlay">
          <img
            src={product.image}
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            loading="lazy"
            style={{ viewTransitionName: `product-img-${product.id}` }}
          />

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="bg-[#1A1A2E]/75 text-white text-[0.625rem] font-black py-1.5 px-4 rounded-full uppercase tracking-widest backdrop-blur-sm">
                Agotado
              </span>
            </div>
          )}

          {/* Like button — bottom-right, only when authenticated */}
          {isAuthenticated && (
            <button
              type="button"
              disabled={isToggling}
              className={`absolute bottom-2.5 right-2.5 bg-surface/80 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer border z-10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 disabled:opacity-50 ${isLiked ? 'text-pink border-pink/30 bg-pink/10' : 'text-on-surface-muted border-stroke/40 hover:bg-pink/10 hover:text-pink hover:border-pink/30'}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); void toggle(); }}
              aria-label={isLiked ? `Quitar ${product.title} de favoritos` : `Agregar ${product.title} a favoritos`}
              aria-pressed={isLiked}
            >
              <HeartIcon filled={isLiked} />
            </button>
          )}
        </div>

        {/* ── Info area ── */}
        <div className="px-3 pt-2.5 pb-1.5 flex flex-col flex-1">
          {product.category && (
            <span className="text-on-surface-muted text-[0.625rem] font-semibold uppercase tracking-wider mb-0.5 truncate">
              {product.category}
            </span>
          )}
          <h4 className="text-xs font-bold text-on-surface leading-snug mb-1.5 line-clamp-2">
            {product.title}
          </h4>
          <div className="mt-auto mb-1">
            <PriceDisplay
              priceMin={product.priceMin}
              priceMax={product.priceMax}
              promoPriceMin={product.promoPriceMin}
              promoPriceMax={product.promoPriceMax}
            />
          </div>
        </div>
      </Link>

      {/* ── CTA ── */}
      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={isOutOfStock || isAdding}
          className="w-full text-white border-none rounded-full py-2 font-nunito font-extrabold text-[0.6875rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
          style={{
            background: isOutOfStock
              ? '#9999BB'
              : isSuccess
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #00C5D4, #009BAB)',
          }}
          onClick={(e) => {
            if (!product.defaultVariantId) return;
            const rect = e.currentTarget.getBoundingClientRect();
            useFlyToCartStore.getState().fire({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
            onAddToCart?.({ id: product.id, variantId: product.defaultVariantId, slug: product.slug, title: product.title, image: product.image, priceMin: product.priceMin });
          }}
        >
          {isOutOfStock ? (
            'Sin stock'
          ) : isAdding ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="opacity-75" />
              </svg>
              Agregando
            </span>
          ) : isSuccess ? (
            <span className="flex items-center justify-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Agregado
            </span>
          ) : (
            '+ Agregar'
          )}
        </button>
      </div>
    </div>
  );
}
