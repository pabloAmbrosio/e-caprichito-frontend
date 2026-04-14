import type { Category } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeGetCategoryById(
  id: string,
): Promise<Category & { children: Category[] }> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/categories/${id}`);
  return handleApiResponse(response);
}
