import { ProductVariantSelector } from './ProductVariantSelector';
import { ProductVariantDetails } from './ProductVariantDetails';
import { useFlyToCartStore } from '@/shared/store/flyToCartStore';
import type { ProductDetail, ProductVariant, DisplayPromotion } from '../../domain/types';
import type { AddToCartProduct } from '@/features/cart/hooks/useAddToCart';

interface ProductInfoProps {
  product: ProductDetail;
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  onAddToCart: (product: AddToCartProduct) => void;
  isAdding: boolean;
  isSuccess: boolean;
}

const BADGE_MAP: Record<string, { label: string; color: string }> = {
  'pieza-unica': { label: 'PIEZA ÚNICA', color: '#FF7A00' },
  'edicion-limitada': { label: 'ED. LIMITADA', color: '#F0177A' },
};

function derivePromoLabel(promo: DisplayPromotion): string | null {
  if (promo.display.badgeText) return promo.display.badgeText;
  if (promo.actionType === 'PERCENTAGE_DISCOUNT') {
    if (promo.discountPercentage != null) return `-${Math.round(promo.discountPercentage)}%`;
    if (promo.originalPriceInCents > 0) {
      const pct = Math.round((promo.discountAmountInCents / promo.originalPriceInCents) * 100);
      return pct > 0 ? `-${pct}%` : null;
    }
  }
  if (promo.actionType === 'BUY_X_GET_Y') {
    try {
      const { buyQuantity, getQuantity } = JSON.parse(promo.actionValue) as { buyQuantity: number; getQuantity: number };
      return `${buyQuantity}x${getQuantity}`;
    } catch {
      // fall through
    }
  }
  return null;
}

function deriveBadge(
  tags: string[],
  isFeatured: boolean,
  selectedVariantId: string,
  variantPromotions?: Record<string, DisplayPromotion[]>,
) {
  const promo = variantPromotions?.[selectedVariantId]?.[0];
  if (promo) {
    const label = derivePromoLabel(promo);
    if (label) {
      return {
        label,
        color: promo.display.badgeColor ?? promo.display.colorPrimary ?? '#F0177A',
      };
    }
  }
  for (const [tag, config] of Object.entries(BADGE_MAP)) {
    if (tags.includes(tag)) return config;
  }
  if (isFeatured) return { label: 'DESTACADO', color: '#00C5D4' };
  return null;
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export function ProductInfo({
  product,
  selectedVariant,
  onVariantChange,
  onAddToCart,
  isAdding,
  isSuccess,
}: ProductInfoProps) {
  const badge = deriveBadge(product.tags, product.isFeatured, selectedVariant.id, product.variantPromotions);
  const category = product.categorias[0];
  const isOutOfStock = product.variants.every((v) => !v.inStock);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    useFlyToCartStore.getState().fire({ x: rect.left, y: rect.top, width: rect.width, height: rect.height, bg: 'linear-gradient(135deg, #F0177A, #C0005A)' });
    onAddToCart({
      id: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      title: product.title,
      image: selectedVariant.images?.[0]?.imageUrl ?? '',
      priceMin: selectedVariant.priceInCents / 100,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Badge + category */}
      <div className="flex items-center gap-2 flex-wrap">
        {badge && (
          <span
            className="text-white text-[0.5625rem] font-black py-1 px-3 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: badge.color }}
          >
            {badge.label}
          </span>
        )}
        {category && (
          <span className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider">
            {category.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-pacifico text-2xl sm:text-3xl lg:text-[2rem] leading-tight text-on-surface">
        {product.title}
      </h1>

      {/* Divider */}
      <div className="h-px bg-stroke/60" />

      {/* Variant selector with dynamic price */}
      <ProductVariantSelector
        variants={product.variants}
        selected={selectedVariant}
        onSelect={onVariantChange}
        variantPromotions={product.variantPromotions}
      />

      {/* Details mini-grid + description accordion */}
      <ProductVariantDetails
        variant={selectedVariant}
        description={product.description}
      />

      {/* Divider */}
      <div className="h-px bg-stroke/60" />

      {/* CTA */}
      <button
        type="button"
        disabled={isOutOfStock || isAdding}
        onClick={(e) => { handleAddToCart(e); }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-nunito font-extrabold text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 hover:scale-[1.02] hover:shadow-[0_0.5rem_1.5rem_rgba(240,23,122,0.4)]"
        style={{
          background: isOutOfStock
            ? '#9999BB'
            : isSuccess
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : 'linear-gradient(135deg, #F0177A, #C0005A)',
        }}
      >
        {isOutOfStock ? (
          'Agotado'
        ) : isAdding ? (
          <>
            <SpinnerIcon />
            Agregando...
          </>
        ) : isSuccess ? (
          <>
            <CheckIcon />
            Agregado al carrito
          </>
        ) : (
          <>
            <CartIcon />
            Agregar al carrito
          </>
        )}
      </button>

      {/* Out of stock notice */}
      {isOutOfStock && (
        <p className="text-center text-xs text-on-surface-muted">
          Este producto no está disponible en este momento.
        </p>
      )}
    </div>
  );
}
