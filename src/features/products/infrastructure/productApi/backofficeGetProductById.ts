import type { BackofficeProductDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeGetProductById(
  id: string,
): Promise<BackofficeProductDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/products/${id}`);
  return handleApiResponse(response);
}
