import type { CreateCategoryInput, Category } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeCreateCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
