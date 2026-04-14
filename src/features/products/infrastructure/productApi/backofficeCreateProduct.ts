import type { InitializeProductInput, BackofficeProductDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeCreateProduct(
  input: InitializeProductInput,
): Promise<BackofficeProductDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
