import type { UpdateProductInput, BackofficeProductDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeUpdateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<BackofficeProductDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
