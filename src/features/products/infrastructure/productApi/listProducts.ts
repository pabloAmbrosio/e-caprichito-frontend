import type { ProductListItem, ProductSearchFilters } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { handleApiResponse } from '@/shared/utils/apiError';
import { buildProductQuery } from './helpers';

export async function listProducts(
  filters?: ProductSearchFilters,
): Promise<{ items: ProductListItem[]; total: number }> {
  const query = buildProductQuery(filters);
  const response = await fetch(`${BASE_URL}/api/products${query}`, {
    credentials: 'include',
  });
  const data = await handleApiResponse(response) as { items: ProductListItem[]; total: number };
  return data;
}
