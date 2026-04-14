import { createProductApi } from '../infrastructure/productApi';
import { mapCategoriesToNavLinks } from './mapCategoriesToNavLinks';
import { mapProductsToCardData, type ProductCardData } from './mapProductsToCardData';
import type { CategoryLink } from '@/shared/components/Navbar';
import { FeatureApiError } from '@/shared/utils/apiError';

export interface CategoryPageInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoticon: string | null;
  isRoot: boolean;
}

export interface SubcategoryChip {
  id: string;
  name: string;
  slug: string;
  emoticon: string | null;
}

export interface ParentCategoryInfo {
  name: string;
  slug: string;
  emoticon: string | null;
}

export interface CategoryPageData {
  navCategories: CategoryLink[];
  category: CategoryPageInfo;
  subcategories: SubcategoryChip[];
  initialProducts: ProductCardData[];
  initialTotal: number;
  categoryIds: string[];
  initialSubcategoryId: string | null;
  parentCategory: ParentCategoryInfo | null;
  generatedAt: number;
}

export async function getCategoryPageData(slug: string): Promise<CategoryPageData> {
  const productApi = createProductApi();

  const { tree, flat } = await productApi.getCategories();

  const category = flat.find((c) => c.slug === slug && c.isActive);
  if (!category) throw new FeatureApiError(`Category not found: ${slug}`, 404);

  const isRoot = category.parentId === null;

  let chips: SubcategoryChip[];
  let allCategoryIds: string[];
  let initialSubcategoryId: string | null;
  let parentCategory: ParentCategoryInfo | null;

  if (isRoot) {
    const children = flat.filter((c) => c.parentId === category.id && c.isActive);
    chips = children.map((c) => ({ id: c.id, name: c.name, slug: c.slug, emoticon: c.emoticon }));
    allCategoryIds = [category.id, ...children.map((c) => c.id)];
    initialSubcategoryId = null;
    parentCategory = null;
  } else {
    const parent = flat.find((c) => c.id === category.parentId);
    if (!parent) throw new FeatureApiError(`Parent category not found for: ${slug}`, 404);
    const siblings = flat.filter((c) => c.parentId === parent.id && c.isActive);
    chips = siblings.map((c) => ({ id: c.id, name: c.name, slug: c.slug, emoticon: c.emoticon }));
    allCategoryIds = [parent.id, ...siblings.map((c) => c.id)];
    initialSubcategoryId = category.id;
    parentCategory = { name: parent.name, slug: parent.slug, emoticon: parent.emoticon };
  }

  // When child is pre-selected, fetch only its products; when root, fetch all
  const fetchIds = initialSubcategoryId ? [initialSubcategoryId] : allCategoryIds;

  const { items, total } = await productApi.list({
    categoryIds: fetchIds,
    limit: 20,
    sort: [{ field: 'createdAt', direction: 'desc' }],
  });

  const navCategories = mapCategoriesToNavLinks(tree);

  return {
    navCategories,
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      emoticon: category.emoticon,
      isRoot,
    },
    subcategories: chips,
    initialProducts: mapProductsToCardData(items),
    initialTotal: total,
    categoryIds: allCategoryIds,
    initialSubcategoryId,
    parentCategory,
    generatedAt: Date.now(),
  };
}
