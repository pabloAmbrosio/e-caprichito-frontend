import type { ImageJsonInput } from './ImageJson';

export interface VariantInput {
  title: string;
  sku: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  details: Record<string, unknown>;
  images?: ImageJsonInput[];
}

export interface InitializeProductInput {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  slug?: string;
  isFeatured?: boolean;
  seoMetadata?: unknown;
  variants: VariantInput[];
}

export interface UpdateProductInput {
  title?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  isFeatured?: boolean;
  seoMetadata?: unknown;
  variants?: Array<VariantInput & { id: string }>;
}
