import { createProductApi } from '../infrastructure/productApi';
import { mapCategoriesToNavLinks } from './mapCategoriesToNavLinks';
import { mapProductsToCardData, type ProductCardData } from './mapProductsToCardData';
import type { CategoryLink } from '@/shared/components/Navbar';
import type { CategoryTreeNode } from '../domain/types';

export interface ProductsPageData {
  navCategories: CategoryLink[];
  categoryTree: CategoryTreeNode[];
  initialProducts: ProductCardData[];
  initialTotal: number;
  generatedAt: number;
}

export async function getProductsPageData(): Promise<ProductsPageData> {
  const productApi = createProductApi();

  const { tree } = await productApi.getCategories();

  const { items, total } = await productApi.list({
    limit: 20,
    sort: [{ field: 'createdAt', direction: 'desc' }],
  });

  const navCategories = mapCategoriesToNavLinks(tree);

  return {
    navCategories,
    categoryTree: tree,
    initialProducts: mapProductsToCardData(items),
    initialTotal: total,
    generatedAt: Date.now(),
  };
}
