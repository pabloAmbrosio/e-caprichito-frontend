import type { CartHistoryItem } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getCartHistory(
  params?: { page?: number; limit?: number },
): Promise<CartHistoryItem[]> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/carts/history${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
