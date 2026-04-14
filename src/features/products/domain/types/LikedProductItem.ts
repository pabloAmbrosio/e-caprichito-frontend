import type { ProductVariant } from './ProductVariant';

export interface LikedProductItem {
  likedAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    tags: string[];
    isFeatured: boolean;
    status: string;
    publishedAt: string | null;
    variants: ProductVariant[];
  };
}
