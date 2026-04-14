import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getLikedIds(): Promise<string[]> {
  const response = await authFetch(`${BASE_URL}/api/products/liked/ids`);
  return handleApiResponse(response);
}
