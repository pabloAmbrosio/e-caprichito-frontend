import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeDeleteVariant(
  id: string,
  variantId: string,
): Promise<{ variantId: string }> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/products/${id}/variants/${variantId}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
