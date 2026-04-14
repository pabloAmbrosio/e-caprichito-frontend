import type {
  CartWithPromotions,
  CartSummary,
  CartValidation,
  CartHistoryItem,
  BackofficeCart,
  AbandonedCart,
} from './types';
import type { PaginatedResponse } from '@/shared/types/api';

export interface CartRepository {
  // Shop
  get(): Promise<CartWithPromotions | null>;
  getSummary(): Promise<CartSummary | null>;
  validate(): Promise<CartValidation>;
  clear(): Promise<void>;
  getHistory(params?: { page?: number; limit?: number }): Promise<CartHistoryItem[]>;
  restore(cartId: string): Promise<CartWithPromotions | null>;
  addItem(productId: string, quantity: number): Promise<CartWithPromotions>;
  addItemsBulk(items: Array<{ productId: string; quantity: number }>): Promise<CartWithPromotions>;
  updateItem(productId: string, quantity: number): Promise<CartWithPromotions>;
  removeItem(productId: string): Promise<CartWithPromotions>;
  applyCoupon(couponCode: string): Promise<CartWithPromotions>;
  removeCoupon(): Promise<CartWithPromotions>;

  // Backoffice
  backofficeList(params?: {
    page?: number; limit?: number; search?: string;
    userIds?: string[]; productIds?: string[];
    categoryIds?: string[]; tags?: string[];
  }): Promise<PaginatedResponse<BackofficeCart>>;
  backofficeListAbandoned(params?: {
    page?: number; limit?: number;
    inactiveDays?: number; minItems?: number;
  }): Promise<PaginatedResponse<AbandonedCart>>;
  backofficeGetById(cartId: string): Promise<BackofficeCart>;
  backofficeDelete(cartId: string): Promise<{ id: string }>;
}
