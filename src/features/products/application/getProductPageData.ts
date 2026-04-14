import { createProductApi } from '../infrastructure/productApi';
import { getBySlugOrId } from '../infrastructure/productApi/getBySlugOrId';
import { mapCategoriesToNavLinks } from './mapCategoriesToNavLinks';
import { mapProductsToCardData, type ProductCardData } from './mapProductsToCardData';
import type { ProductDetail as ProductDetailType } from '../domain/types';
import type { CategoryLink } from '@/shared/components/Navbar';

export interface ProductPageData {
  product: ProductDetailType;
  recommended: ProductCardData[];
  navCategories: CategoryLink[];
}

export async function getProductPageData(slug: string): Promise<ProductPageData> {
  try {
    const productApi = createProductApi();

    // Phase 1 (parallel): categories for navbar + product detail
    const [{ tree }, product] = await Promise.all([
      productApi.getCategories(),
      getBySlugOrId(slug),
    ]);

    const navCategories = mapCategoriesToNavLinks(tree);

    // Phase 2: recommended by same category, exclude current product
    const { items: recommendedItems } = await productApi.list({
      categoryIds: [product.categoryId],
      limit: 7, // fetch 7 to have buffer after filtering out current product
    });

    const recommended = mapProductsToCardData(
      recommendedItems.filter((item) => item.id !== product.id).slice(0, 6)
    );

    return {
      product,
      recommended,
      navCategories,
    };
  } catch (error) {
    console.error('[getProductPageData]', error);
    throw error;
  }
}
