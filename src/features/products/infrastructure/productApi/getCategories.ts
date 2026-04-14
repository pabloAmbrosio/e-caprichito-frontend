import type { CategoryListResponse, CategoryTypeFilter } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getCategories(type?: CategoryTypeFilter): Promise<CategoryListResponse> {
  const params = type && type !== 'all' ? `?type=${type}` : '';
  const response = await fetch(`${BASE_URL}/api/categories${params}`, {
    credentials: 'include',
  });
  return handleApiResponse(response);
}
