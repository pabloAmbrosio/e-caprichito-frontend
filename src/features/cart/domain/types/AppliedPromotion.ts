import type { ActionType } from '@/shared/types/enums';

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  discountAmountInCents: number;
  actionType: ActionType;
}
