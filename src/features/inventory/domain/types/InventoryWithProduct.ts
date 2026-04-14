import type { InventoryItem } from './InventoryItem';

export interface InventoryWithProduct extends InventoryItem {
  product: { id: string; title: string };
}
