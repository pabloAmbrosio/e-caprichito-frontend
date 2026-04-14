import type { PromotionAction } from '../../domain/types';
import type { ActionType, ActionTarget } from '@/shared/types/enums';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function addPromotionAction(
  id: string,
  action: { type: ActionType; value: string; target: ActionTarget; maxDiscountInCents?: number },
): Promise<PromotionAction> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  return handleApiResponse(response);
}
