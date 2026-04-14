import type { PromotionWithCount } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function getPromotionById(id: string): Promise<PromotionWithCount> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}`);
  return handleApiResponse(response);
}
