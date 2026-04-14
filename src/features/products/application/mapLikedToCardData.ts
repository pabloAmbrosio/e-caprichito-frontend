import type { LikedProductItem, ProductVariant } from '../domain/types';
import type { ProductCardData } from './mapProductsToCardData';

const PLACEHOLDER = '/images/products/placeholder.jpg';

function derivePriceRange(variants: ProductVariant[]): { priceMin: number; priceMax: number } {
  if (variants.length === 0) return { priceMin: 0, priceMax: 0 };
  const prices = variants.map((v) => v.priceInCents);
  return {
    priceMin: Math.min(...prices) / 100,
    priceMax: Math.max(...prices) / 100,
  };
}

function deriveBadge(
  tags: string[],
  isFeatured: boolean,
): { badge: string | null; badgeColor: string | null } {
  if (tags.includes('pieza-unica')) return { badge: 'PIEZA ÚNICA', badgeColor: '#FF7A00' };
  if (tags.includes('edicion-limitada')) return { badge: 'ED. LIMITADA', badgeColor: '#F0177A' };
  if (isFeatured) return { badge: 'DESTACADO', badgeColor: '#00C5D4' };
  return { badge: null, badgeColor: null };
}

export function mapLikedToCardData(items: LikedProductItem[]): ProductCardData[] {
  return items.map(({ product }) => {
    const { priceMin, priceMax } = derivePriceRange(product.variants);
    const { badge, badgeColor } = deriveBadge(product.tags, product.isFeatured);
    const inStock = product.variants.some((v) => v.inStock);

    const defaultVariant = product.variants.find((v) => v.inStock) ?? product.variants[0] ?? null;

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: defaultVariant?.images?.[0]?.imageUrl ?? PLACEHOLDER,
      badge,
      badgeColor,
      category: null,
      priceMin,
      priceMax,
      inStock,
      defaultVariantId: defaultVariant?.id ?? null,
      promoPriceMin: null,
      promoPriceMax: null,
      promoBadge: null,
      promoBadgeColor: null,
    };
  });
}
