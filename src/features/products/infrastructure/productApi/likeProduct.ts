import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function likeProduct(
  id: string,
): Promise<{ id: string; abstractProductId: string; createdAt: string }> {
  const response = await authFetch(`${BASE_URL}/api/products/${id}/like`, {
    method: 'POST',
  });
  return handleApiResponse(response);
}
