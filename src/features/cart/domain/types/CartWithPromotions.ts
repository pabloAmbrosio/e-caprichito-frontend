import type { CartItem } from './CartItem';
import type { AppliedPromotion } from './AppliedPromotion';

export interface CartWithPromotions {
  items: CartItem[];
  couponCode: string | null;
  subtotal: number;
  appliedPromotions: AppliedPromotion[];
  totalDiscount: number;
  total: number;
}
