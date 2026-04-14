export type {
  InventoryItem,
  InventoryWithProduct,
} from './domain/types';

export type { InventoryRepository } from './domain/InventoryRepository';

export { createInventoryApi } from './infrastructure/inventoryApi';
