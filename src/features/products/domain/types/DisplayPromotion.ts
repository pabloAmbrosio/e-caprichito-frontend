export interface DisplayPromotion {
  promotionId: string;
  promotionName: string;
  description: string | null;
  actionType: 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y';
  actionValue: string;
  originalPriceInCents: number;
  discountAmountInCents: number;
  finalPriceInCents: number;
  discountPercentage: number | null;
  display: {
    badgeText: string | null;
    badgeColor: string | null;
    colorPrimary: string | null;
    colorSecondary: string | null;
  };
}
