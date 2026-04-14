import type { LikedProductItem } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getLiked(
  params?: { limit?: number; offset?: number },
): Promise<{ items: LikedProductItem[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.offset !== undefined) query.set('offset', String(params.offset));
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/products/liked${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
