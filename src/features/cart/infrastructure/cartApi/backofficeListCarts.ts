import type { BackofficeCart } from '../../domain/types';
import type { PaginatedResponse } from '@/shared/types/api';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeListCarts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  userIds?: string[];
  productIds?: string[];
  categoryIds?: string[];
  tags?: string[];
}): Promise<PaginatedResponse<BackofficeCart>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.userIds?.length) query.set('userIds', params.userIds.join(','));
  if (params?.productIds?.length) query.set('productIds', params.productIds.join(','));
  if (params?.categoryIds?.length) query.set('categoryIds', params.categoryIds.join(','));
  if (params?.tags?.length) query.set('tags', params.tags.join(','));
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/backoffice/carts${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
