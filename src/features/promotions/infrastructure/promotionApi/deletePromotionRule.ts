import type { PromotionRule } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function deletePromotionRule(id: string, ruleId: string): Promise<PromotionRule> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}/rules/${ruleId}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
