import type { ProductListItem } from '../domain/types';
import type { HeroBannerSlide } from '@/shared/components/HeroGrid';

function deriveBadge(product: ProductListItem): string | undefined {
  if (product.tags.includes('pieza-unica')) return '✨ PIEZA ÚNICA';
  if (product.tags.includes('edicion-limitada')) return '🔥 EDICIÓN LIMITADA';
  if (product.isFeatured) return '⭐ DESTACADO';
  return undefined;
}

export function mapProductsToHeroSlides(products: ProductListItem[]): HeroBannerSlide[] {
  return products.map((product) => ({
    productId: product.id,
    badge: deriveBadge(product),
    title: product.title,
    description:
      product.description.length > 120
        ? `${product.description.slice(0, 117)}...`
        : product.description,
    ctaLabel: 'Ver producto →',
    ctaHref: `/product/${product.slug}`,
    image: product.variantes[0]?.images?.[0]?.imageUrl ?? '/images/hero/placeholder.jpg',
  }));
}
