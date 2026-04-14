import type { CartWithPromotions } from './CartWithPromotions';

export interface CartHistoryItem extends CartWithPromotions {
  id: string;
  abandonedAt: string;
}
