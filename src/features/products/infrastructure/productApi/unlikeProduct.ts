import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function unlikeProduct(id: string): Promise<{ removed: boolean }> {
  const response = await authFetch(`${BASE_URL}/api/products/${id}/like`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
