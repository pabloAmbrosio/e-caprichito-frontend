import type { AbandonedCart } from '../../domain/types';
import type { PaginatedResponse } from '@/shared/types/api';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeListAbandoned(params?: {
  page?: number;
  limit?: number;
  inactiveDays?: number;
  minItems?: number;
}): Promise<PaginatedResponse<AbandonedCart>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.inactiveDays !== undefined) query.set('inactiveDays', String(params.inactiveDays));
  if (params?.minItems !== undefined) query.set('minItems', String(params.minItems));
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/backoffice/carts/abandoned${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
