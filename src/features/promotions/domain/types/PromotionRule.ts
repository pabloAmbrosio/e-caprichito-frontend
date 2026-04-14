import type { RuleType, ComparisonOperator } from '@/shared/types/enums';

export interface PromotionRule {
  id: string;
  promotionId: string;
  type: RuleType;
  operator: ComparisonOperator;
  value: string;
  createdAt: string;
  updatedAt: string;
}
