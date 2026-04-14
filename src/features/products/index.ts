export type {
  ImageJson,
  ImageJsonInput,
  CategoryBreadcrumb,
  ProductVariant,
  ProductListItem,
  ProductDetail,
  LikedProductItem,
  Category,
  CategoryTreeNode,
  CategoryListResponse,
  CategoryTypeFilter,
  BackofficeVariant,
  BackofficeProductDetail,
  SortOption,
  ProductSearchFilters,
  VariantInput,
  InitializeProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  AutocompleteSuggestion,
  DisplayPromotion,
} from './domain/types';

export type { ProductRepository } from './domain/ProductRepository';

export { createProductApi } from './infrastructure/productApi';
export { getBySlugOrId } from './infrastructure/productApi/getBySlugOrId';
export { mapCategoriesToNavLinks } from './application/mapCategoriesToNavLinks';
export { mapProductsToHeroSlides } from './application/mapProductsToHeroSlides';
export { mapCategoriesToCategoryRow } from './application/mapCategoriesToCategoryRow';
export { mapProductsToCardData } from './application/mapProductsToCardData';
export { mapLikedToCardData } from './application/mapLikedToCardData';
export { getHomePageData } from './application/getHomePageData';
export type { HomePageData, ProductSectionData } from './application/getHomePageData';
export { getProductPageData } from './application/getProductPageData';
export type { ProductPageData } from './application/getProductPageData';
export { getCategoryPageData } from './application/getCategoryPageData';
export type { CategoryPageData, CategoryPageInfo, SubcategoryChip, ParentCategoryInfo } from './application/getCategoryPageData';
export { getProductsPageData } from './application/getProductsPageData';
export type { ProductsPageData } from './application/getProductsPageData';

export type { ProductCardData } from './application/mapProductsToCardData';
export type { CategoryItemData } from './components/CategoryItem';
export { ProductCard } from './components/ProductCard';
export { ProductsSection } from './components/ProductsSection';
export { CategoryItem } from './components/CategoryItem';
export { ProductHead } from './components/ProductDetail/ProductHead';

export { useMyFavorites } from './hooks/useMyFavorites';
export { useLikedInit } from './hooks/useLikedInit';
export { BackofficeProductsFilters } from './components/BackofficeProductsFilters';
export { BackofficeProductsTable } from './components/BackofficeProductsTable';
export { BackofficeCategoriesTable } from './components/BackofficeCategoriesTable';

export { autocompleteProducts } from './infrastructure/productApi/autocompleteProducts';
export { useSearchAutocomplete } from './hooks/useSearchAutocomplete';
