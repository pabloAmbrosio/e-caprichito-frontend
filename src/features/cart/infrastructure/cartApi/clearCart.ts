import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function clearCart(): Promise<void> {
  const response = await authFetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
  });
  await handleApiResponse<unknown>(response);
}
