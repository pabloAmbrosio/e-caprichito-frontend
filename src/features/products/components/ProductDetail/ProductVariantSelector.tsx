import type { ProductVariant, DisplayPromotion } from '../../domain/types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selected: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
  variantPromotions?: Record<string, DisplayPromotion[]>;
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

export function ProductVariantSelector({ variants, selected, onSelect, variantPromotions }: ProductVariantSelectorProps) {
  const allOutOfStock = variants.every((v) => !v.inStock);

  // Promo de la variante seleccionada (primera = mayor prioridad)
  const selectedPromos = variantPromotions?.[selected.id];
  const primaryPromo = selectedPromos?.[0] ?? null;

  const hasPercentageDiscount = primaryPromo?.actionType === 'PERCENTAGE_DISCOUNT'
    && primaryPromo.discountAmountInCents > 0;

  // Precio principal: con descuento si hay promo, original si no
  const displayPriceCents = hasPercentageDiscount
    ? primaryPromo.finalPriceInCents
    : selected.priceInCents;

  // Precio tachado: originalPriceInCents del backend (precio base de la promo)
  const strikethroughCents = hasPercentageDiscount
    ? primaryPromo.originalPriceInCents
    : null;

  // compareAtPrice solo se muestra cuando NO hay promo activa
  const compareAtCents = !hasPercentageDiscount
    && selected.compareAtPriceInCents !== null
    && selected.compareAtPriceInCents > selected.priceInCents
    ? selected.compareAtPriceInCents
    : null;

  return (
    <div className="space-y-3">
      {/* Dynamic price display */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl font-black text-on-surface tabular-nums">
          {formatPrice(displayPriceCents)}
        </span>

        {/* Precio original tachado (promo) */}
        {strikethroughCents !== null && (
          <span className="text-lg font-semibold text-on-surface-muted line-through tabular-nums">
            {formatPrice(strikethroughCents)}
          </span>
        )}

        {/* Badge de promo (PERCENTAGE_DISCOUNT) */}
        {hasPercentageDiscount && (() => {
          const label = primaryPromo.display.badgeText
            ?? (primaryPromo.discountPercentage != null
              ? `-${Math.round(primaryPromo.discountPercentage)}%`
              : null);
          if (!label) return null;
          return (
            <span
              className="text-xs font-black py-0.5 px-2 rounded-full text-white"
              style={{ backgroundColor: primaryPromo.display.badgeColor ?? primaryPromo.display.colorPrimary ?? '#F0177A' }}
            >
              {label}
            </span>
          );
        })()}

        {/* Badge de promo (BUY_X_GET_Y) */}
        {primaryPromo?.actionType === 'BUY_X_GET_Y' && primaryPromo.display.badgeText && (
          <span
            className="text-xs font-black py-0.5 px-2 rounded-full text-white"
            style={{ backgroundColor: primaryPromo.display.badgeColor ?? primaryPromo.display.colorPrimary ?? '#00C5D4' }}
          >
            {primaryPromo.display.badgeText}
          </span>
        )}

        {/* compareAtPrice tachado + % OFF (solo sin promo activa) */}
        {compareAtCents !== null && (
          <>
            <span className="text-lg font-semibold text-on-surface-muted line-through tabular-nums">
              {formatPrice(compareAtCents)}
            </span>
            <span
              className="text-xs font-black py-0.5 px-2 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
            >
              {Math.round((1 - selected.priceInCents / compareAtCents) * 100)}% OFF
            </span>
          </>
        )}
      </div>

      {/* Descripción de la promo */}
      {primaryPromo?.description && (
        <p className="text-xs font-semibold text-turquoise">
          {primaryPromo.description}
        </p>
      )}

      {/* Variant chips — only shown when there are multiple variants */}
      {variants.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-2">
            Variante
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = variant.id === selected.id;
              const isOutOfStock = !variant.inStock && !allOutOfStock;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => onSelect(variant)}
                  className={[
                    'px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    isSelected
                      ? 'border-turquoise bg-turquoise/10 text-turquoise shadow-[0_0_0_1px_#00C5D4]'
                      : isOutOfStock
                        ? 'border-stroke text-on-surface-muted opacity-40 line-through cursor-not-allowed'
                        : 'border-stroke text-on-surface hover:border-turquoise/60 hover:text-turquoise hover:bg-turquoise/5 cursor-pointer',
                  ].join(' ')}
                  aria-pressed={isSelected}
                  aria-label={`${variant.title}${isOutOfStock ? ' — agotado' : ''}`}
                >
                  {variant.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
