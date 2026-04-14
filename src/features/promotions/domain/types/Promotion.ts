import type { RuleOperator } from '@/shared/types/enums';
import type { PromotionRule } from './PromotionRule';
import type { PromotionAction } from './PromotionAction';

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  couponCode: string | null;
  imageUrl: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  priority: number;
  stackable: boolean;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  maxUsesPerUser: number | null;
  ruleOperator: RuleOperator;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  rules: PromotionRule[];
  actions: PromotionAction[];
}
