import type {
  ProductListItem,
  ProductDetail,
  LikedProductItem,
  ProductSearchFilters,
  CategoryListResponse,
  CategoryTypeFilter,
  Category,
  BackofficeProductDetail,
  InitializeProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './types';

export interface ProductRepository {
  // Shop
  list(filters?: ProductSearchFilters): Promise<{ items: ProductListItem[]; total: number }>;
  getBySlugOrId(idOrSlug: string): Promise<ProductDetail>;
  getLiked(params?: { limit?: number; offset?: number }): Promise<{ items: LikedProductItem[]; total: number }>;
  getLikedIds(): Promise<string[]>;
  like(id: string): Promise<{ id: string; abstractProductId: string; createdAt: string }>;
  unlike(id: string): Promise<{ removed: boolean }>;
  getCategories(type?: CategoryTypeFilter): Promise<CategoryListResponse>;

  // Backoffice
  backofficeCreate(input: InitializeProductInput): Promise<BackofficeProductDetail>;
  backofficeGetById(id: string): Promise<BackofficeProductDetail>;
  backofficeUpdate(id: string, input: UpdateProductInput): Promise<BackofficeProductDetail>;
  backofficeDelete(id: string): Promise<{ id: string }>;
  backofficeUpdateStatus(id: string, status: string): Promise<BackofficeProductDetail>;
  backofficeAddVariants(id: string, variants: unknown[]): Promise<BackofficeProductDetail>;
  backofficeDeleteVariant(id: string, variantId: string): Promise<{ variantId: string }>;
  backofficeUpdateVariantStatus(id: string, variantId: string, status: string): Promise<BackofficeProductDetail>;
  backofficeGetCategories(type?: CategoryTypeFilter): Promise<CategoryListResponse>;
  backofficeCreateCategory(input: CreateCategoryInput): Promise<Category>;
  backofficeGetCategoryById(id: string): Promise<Category & { children: Category[] }>;
  backofficeUpdateCategory(id: string, input: UpdateCategoryInput): Promise<Category>;
  backofficeDeleteCategory(id: string): Promise<{ id: string }>;
}
