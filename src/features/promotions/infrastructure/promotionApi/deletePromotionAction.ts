import type { PromotionAction } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function deletePromotionAction(id: string, actionId: string): Promise<PromotionAction> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}/actions/${actionId}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
