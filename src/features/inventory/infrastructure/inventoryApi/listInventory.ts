import type { InventoryWithProduct } from '../../domain/types';
import type { PaginatedResponse } from '@/shared/types/api';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function listInventory(params?: {
  page?: number;
  limit?: number;
  search?: string;
  minStock?: number;
  maxStock?: number;
  outOfStock?: boolean;
}): Promise<PaginatedResponse<InventoryWithProduct>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.minStock !== undefined)
    query.set('minStock', String(params.minStock));
  if (params?.maxStock !== undefined)
    query.set('maxStock', String(params.maxStock));
  if (params?.outOfStock !== undefined)
    query.set('outOfStock', String(params.outOfStock));
  const qs = query.toString();
  const response = await authFetch(
    `${BASE_URL}/api/backoffice/inventory${qs ? `?${qs}` : ''}`,
  );
  return handleApiResponse(response);
}
