import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeDeleteCategory(id: string): Promise<{ id: string }> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/categories/${id}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
