import type { Promotion, UpdatePromotionInput } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function updatePromotion(id: string, input: UpdatePromotionInput): Promise<Promotion> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
