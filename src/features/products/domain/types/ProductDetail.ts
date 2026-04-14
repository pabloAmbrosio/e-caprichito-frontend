import type { CategoryBreadcrumb } from './CategoryBreadcrumb';
import type { ProductVariant } from './ProductVariant';
import type { DisplayPromotion } from './DisplayPromotion';

export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categorias: CategoryBreadcrumb[];
  tags: string[];
  isFeatured: boolean;
  seoMetadata: unknown | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  isLikedByUser: boolean;
  variantPromotions?: Record<string, DisplayPromotion[]>;
}
