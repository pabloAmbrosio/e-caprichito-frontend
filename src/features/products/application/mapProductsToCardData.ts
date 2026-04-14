import type { ProductListItem } from '../domain/types';

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  image: string;
  badge: string | null;
  badgeColor: string | null;
  category: string | null;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  defaultVariantId: string | null;
  /** Precio mínimo final con descuento aplicado (pesos). null si no hay promo PERCENTAGE_DISCOUNT */
  promoPriceMin: number | null;
  /** Precio máximo final con descuento aplicado (pesos). null si no hay promo PERCENTAGE_DISCOUNT */
  promoPriceMax: number | null;
  /** Badge de promo (solo si TODAS las variantes comparten la misma promo). null si difieren o no hay */
  promoBadge: string | null;
  /** Color del badge de promo */
  promoBadgeColor: string | null;
}

const BADGE_MAP: Record<string, { label: string; color: string }> = {
  'pieza-unica': { label: 'PIEZA ÚNICA', color: '#FF7A00' },
  'edicion-limitada': { label: 'ED. LIMITADA', color: '#F0177A' },
};

function deriveBadge(product: ProductListItem): { badge: string | null; badgeColor: string | null } {
  for (const [tag, config] of Object.entries(BADGE_MAP)) {
    if (product.tags.includes(tag)) {
      return { badge: config.label, badgeColor: config.color };
    }
  }
  if (product.isFeatured) {
    return { badge: 'DESTACADO', badgeColor: '#00C5D4' };
  }
  return { badge: null, badgeColor: null };
}

function derivePriceRange(product: ProductListItem): { priceMin: number; priceMax: number } {
  const prices = product.variantes.map((v) => v.priceInCents);

  if (prices.length === 0) return { priceMin: 0, priceMax: 0 };

  return {
    priceMin: Math.min(...prices) / 100,
    priceMax: Math.max(...prices) / 100,
  };
}

function derivePromoInfo(product: ProductListItem): {
  promoPriceMin: number | null;
  promoPriceMax: number | null;
  promoBadge: string | null;
  promoBadgeColor: string | null;
} {
  const promoMap = product.variantPromotions;

  if (!promoMap || Object.keys(promoMap).length === 0) {
    return { promoPriceMin: null, promoPriceMax: null, promoBadge: null, promoBadgeColor: null };
  }

  const variants = product.variantes;
  const effectivePrices: number[] = [];
  const firstPromoIds: string[] = [];
  let hasAnyDiscount = false;

  for (const v of variants) {
    const promos = promoMap[v.id];
    const first = promos?.[0];

    if (first?.actionType === 'PERCENTAGE_DISCOUNT' && first.discountAmountInCents > 0) {
      effectivePrices.push(first.finalPriceInCents / 100);
      hasAnyDiscount = true;
    } else {
      effectivePrices.push(v.priceInCents / 100);
    }

    if (first) {
      firstPromoIds.push(first.promotionId);
    }
  }

  const promoPriceMin = hasAnyDiscount ? Math.min(...effectivePrices) : null;
  const promoPriceMax = hasAnyDiscount ? Math.max(...effectivePrices) : null;

  // Badge uniforme: todas las variantes comparten la misma primera promo
  const allSamePromo = firstPromoIds.length === variants.length
    && firstPromoIds.length > 0
    && firstPromoIds.every((id) => id === firstPromoIds[0]);

  let promoBadge: string | null = null;
  let promoBadgeColor: string | null = null;

  if (allSamePromo) {
    const firstVariantId = variants[0]?.id;
    const promo = firstVariantId ? promoMap[firstVariantId]?.[0] : undefined;
    if (promo) {
      let derivedLabel: string | null = promo.display.badgeText ?? null;
      if (!derivedLabel) {
        if (promo.actionType === 'PERCENTAGE_DISCOUNT' && promo.discountPercentage != null) {
          derivedLabel = `-${Math.round(promo.discountPercentage)}%`;
        } else if (promo.actionType === 'BUY_X_GET_Y') {
          try {
            const { buyQuantity, getQuantity } = JSON.parse(promo.actionValue) as { buyQuantity: number; getQuantity: number };
            derivedLabel = `${buyQuantity}x${getQuantity}`;
          } catch {
            derivedLabel = promo.promotionName;
          }
        }
      }
      promoBadge = derivedLabel ?? promo.promotionName;
      promoBadgeColor = promo.display.badgeColor ?? promo.display.colorPrimary ?? '#F0177A';
    }
  }

  return { promoPriceMin, promoPriceMax, promoBadge, promoBadgeColor };
}

export function mapProductsToCardData(products: ProductListItem[]): ProductCardData[] {
  return products.map((product) => {
    const { badge: tagBadge, badgeColor: tagBadgeColor } = deriveBadge(product);
    const { priceMin, priceMax } = derivePriceRange(product);
    const { promoPriceMin, promoPriceMax, promoBadge, promoBadgeColor } = derivePromoInfo(product);

    const defaultVariant = product.variantes.find((v) => v.inStock) ?? product.variantes[0] ?? null;

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: defaultVariant?.images?.[0]?.imageUrl ?? '/images/products/placeholder.jpg',
      badge: promoBadge ?? tagBadge,
      badgeColor: promoBadgeColor ?? tagBadgeColor,
      category: product.categorias[0]?.name ?? null,
      priceMin,
      priceMax,
      inStock: product.inStock,
      defaultVariantId: defaultVariant?.id ?? null,
      promoPriceMin,
      promoPriceMax,
      promoBadge,
      promoBadgeColor,
    };
  });
}
