import type { ProductSearchFilters } from '../../domain/types';

export function buildProductQuery(filters?: ProductSearchFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();

  if (filters.categoryIds?.length) params.set('categoryIds', filters.categoryIds.join(','));
  if (filters.title) params.set('title', filters.title);
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));
  if (filters.isFeatured !== undefined) params.set('isFeatured', String(filters.isFeatured));
  if (filters.minPriceInCents !== undefined) params.set('minPriceInCents', String(filters.minPriceInCents));
  if (filters.maxPriceInCents !== undefined) params.set('maxPriceInCents', String(filters.maxPriceInCents));
  if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
  if (filters.createdTo) params.set('createdTo', filters.createdTo);
  if (filters.sort?.length) params.set('sort', JSON.stringify(filters.sort));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  if (filters.randomSeed !== undefined) params.set('randomSeed', String(filters.randomSeed));
  if (filters.includeSales) params.set('includeSales', 'true');
  if (filters.includeLikes) params.set('includeLikes', 'true');

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
