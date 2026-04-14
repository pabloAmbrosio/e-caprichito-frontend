import type { RuleOperator } from '@/shared/types/enums';

export interface CreatePromotionInput {
  name: string;
  startsAt: string;
  description?: string;
  couponCode?: string;
  imageUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  badgeText?: string;
  badgeColor?: string;
  priority?: number;
  stackable?: boolean;
  isActive?: boolean;
  endsAt?: string;
  maxUsesPerUser?: number;
  ruleOperator?: RuleOperator;
}

export interface UpdatePromotionInput {
  name?: string;
  description?: string | null;
  couponCode?: string | null;
  imageUrl?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  priority?: number;
  stackable?: boolean;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string | null;
  maxUsesPerUser?: number | null;
  ruleOperator?: RuleOperator;
}
