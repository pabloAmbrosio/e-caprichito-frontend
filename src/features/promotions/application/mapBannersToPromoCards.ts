import type { ProductBanner } from '../domain/types';
import type { HeroPromoCardData } from '@/shared/components/HeroGrid';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #00C5D4, #009BAB)';

function buildActionHeadline(action: ProductBanner['action']): string {
  if (action.type === 'PERCENTAGE_DISCOUNT') return `${action.value}% OFF`;
  if (action.type === 'BUY_X_GET_Y') {
    const [buy, get] = action.value.split(':');
    return `${buy}x${get}`;
  }
  return '';
}

function buildHref(filters: ProductBanner['filters']): string {
  const params = new URLSearchParams();

  if (filters.categoryIds.length > 0) {
    params.set('categories', filters.categoryIds.join(','));
  }
  if (filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  if (filters.productIds.length === 1) {
    return `/product/${filters.productIds[0]}`;
  }

  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function mapBannersToPromoCards(banners: ProductBanner[], limit = 3): HeroPromoCardData[] {
  return banners.slice(0, limit).map((banner) => ({
    gradient:
      banner.colorPrimary && banner.colorSecondary
        ? `linear-gradient(135deg, ${banner.colorPrimary}, ${banner.colorSecondary})`
        : DEFAULT_GRADIENT,
    headline: buildActionHeadline(banner.action),
    title: banner.name,
    subtitle: banner.description ?? null,
    emoji: banner.action.type === 'PERCENTAGE_DISCOUNT' ? '🏷️' : '🎉',
    href: buildHref(banner.filters),
    image: banner.imageUrl ?? null,
    badgeColor: banner.badgeColor ?? null,
  }));
}
