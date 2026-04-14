import type { ActionType, ActionTarget } from '@/shared/types/enums';

export interface PromotionAction {
  id: string;
  promotionId: string;
  type: ActionType;
  value: string;
  maxDiscountInCents: number | null;
  target: ActionTarget;
  createdAt: string;
  updatedAt: string;
}
