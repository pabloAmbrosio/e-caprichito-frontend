import type { ProductStatus } from '@/shared/types/enums';
import type { ImageJson } from './ImageJson';

export interface BackofficeVariant {
  id: string;
  abstractProductId: string;
  sku: string;
  title: string;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  details: Record<string, unknown>;
  images: ImageJson[] | null;
  status: ProductStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
}

export interface BackofficeProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  tags: string[];
  isFeatured: boolean;
  seoMetadata: unknown | null;
  status: ProductStatus;
  publishedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  variants: BackofficeVariant[];
}
