import type { ProductStatus } from '@/shared/types/enums';
import type { CategoryBreadcrumb } from './CategoryBreadcrumb';
import type { ImageJson } from './ImageJson';
import type { DisplayPromotion } from './DisplayPromotion';

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categorias: CategoryBreadcrumb[];
  tags: string[];
  status: ProductStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variantes: Array<{
    id: string;
    sku: string;
    title: string;
    priceInCents: number;
    images: ImageJson[] | null;
    details: Record<string, unknown>;
    inStock: boolean;
  }>;
  inStock: boolean;
  totalSales: number;
  totalLikes: number;
  variantPromotions?: Record<string, DisplayPromotion[]>;
}
