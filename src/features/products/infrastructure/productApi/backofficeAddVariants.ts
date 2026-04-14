import type { BackofficeProductDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeAddVariants(
  id: string,
  variants: unknown[],
): Promise<BackofficeProductDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/products/${id}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variants }),
  });
  return handleApiResponse(response);
}
