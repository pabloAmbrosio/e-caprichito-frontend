export interface CartSummary {
  cartId: string;
  totalItems: number;
  subtotalInCents: number;
  hasCoupon: boolean;
}
