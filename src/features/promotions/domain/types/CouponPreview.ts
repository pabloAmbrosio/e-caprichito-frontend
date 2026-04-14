import type { ActionType } from '@/shared/types/enums';

export interface CouponPreview {
  originalTotalInCents: number;
  finalTotalInCents: number;
  totalDiscountInCents: number;
  appliedPromotions: Array<{
    promotionId: string;
    promotionName: string;
    discountAmountInCents: number;
    actionType: ActionType;
  }>;
}
