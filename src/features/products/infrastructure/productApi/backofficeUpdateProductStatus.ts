import type { BackofficeProductDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeUpdateProductStatus(
  id: string,
  status: string,
): Promise<BackofficeProductDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/products/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleApiResponse(response);
}
