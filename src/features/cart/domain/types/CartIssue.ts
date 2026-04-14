export type CartIssueType = 'PRODUCT_UNAVAILABLE' | 'OUT_OF_STOCK' | 'PRICE_CHANGED' | 'COUPON_INVALID';

export interface CartIssue {
  type: CartIssueType;
  productId?: string;
  detail: string;
}
