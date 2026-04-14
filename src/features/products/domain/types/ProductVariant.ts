import type { ImageJson } from './ImageJson';

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  details: Record<string, unknown>;
  images: ImageJson[] | null;
  inStock: boolean;
}
