import type { PromotionRule } from '../../domain/types';
import type { RuleType, ComparisonOperator } from '@/shared/types/enums';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function addPromotionRule(
  id: string,
  rule: { type: RuleType; operator: ComparisonOperator; value: string },
): Promise<PromotionRule> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  return handleApiResponse(response);
}
