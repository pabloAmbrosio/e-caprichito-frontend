import type { InventoryItem, InventoryWithProduct } from './types';
import type { PaginatedResponse } from '@/shared/types/api';

export interface InventoryRepository {
  create(productId: string, physicalStock: number): Promise<InventoryItem>;
  getByProductId(productId: string): Promise<InventoryWithProduct>;
  list(params?: {
    page?: number; limit?: number; search?: string;
    minStock?: number; maxStock?: number; outOfStock?: boolean;
  }): Promise<PaginatedResponse<InventoryWithProduct>>;
  reserve(productId: string, quantity: number): Promise<InventoryWithProduct>;
  release(productId: string, quantity: number): Promise<InventoryWithProduct>;
}
