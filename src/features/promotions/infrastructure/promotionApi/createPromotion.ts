import type { Promotion, CreatePromotionInput } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
