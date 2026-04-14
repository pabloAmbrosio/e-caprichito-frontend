export interface InventoryItem {
  id: string;
  productId: string;
  physicalStock: number;
  reservedStock: number;
  createdAt: string;
  updatedAt: string;
  availableStock: number;
}
