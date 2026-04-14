import type { CategoryListResponse, CategoryTypeFilter } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeGetCategories(type?: CategoryTypeFilter): Promise<CategoryListResponse> {
  const params = type && type !== 'all' ? `?type=${type}` : '';
  const response = await authFetch(`${BASE_URL}/api/backoffice/categories${params}`);
  return handleApiResponse(response);
}
