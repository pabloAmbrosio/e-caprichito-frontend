import type { ProductRepository } from '../../domain/ProductRepository';
import { listProducts } from './listProducts';
import { getBySlugOrId } from './getBySlugOrId';
import { getLiked } from './getLiked';
import { getLikedIds } from './getLikedIds';
import { likeProduct } from './likeProduct';
import { unlikeProduct } from './unlikeProduct';
import { getCategories } from './getCategories';
import { backofficeCreateProduct } from './backofficeCreateProduct';
import { backofficeGetProductById } from './backofficeGetProductById';
import { backofficeUpdateProduct } from './backofficeUpdateProduct';
import { backofficeDeleteProduct } from './backofficeDeleteProduct';
import { backofficeUpdateProductStatus } from './backofficeUpdateProductStatus';
import { backofficeAddVariants } from './backofficeAddVariants';
import { backofficeDeleteVariant } from './backofficeDeleteVariant';
import { backofficeUpdateVariantStatus } from './backofficeUpdateVariantStatus';
import { backofficeGetCategories } from './backofficeGetCategories';
import { backofficeCreateCategory } from './backofficeCreateCategory';
import { backofficeGetCategoryById } from './backofficeGetCategoryById';
import { backofficeUpdateCategory } from './backofficeUpdateCategory';
import { backofficeDeleteCategory } from './backofficeDeleteCategory';

export function createProductApi(): ProductRepository {
  return {
    list: listProducts,
    getBySlugOrId,
    getLiked,
    getLikedIds,
    like: likeProduct,
    unlike: unlikeProduct,
    getCategories,
    backofficeCreate: backofficeCreateProduct,
    backofficeGetById: backofficeGetProductById,
    backofficeUpdate: backofficeUpdateProduct,
    backofficeDelete: backofficeDeleteProduct,
    backofficeUpdateStatus: backofficeUpdateProductStatus,
    backofficeAddVariants: backofficeAddVariants,
    backofficeDeleteVariant: backofficeDeleteVariant,
    backofficeUpdateVariantStatus: backofficeUpdateVariantStatus,
    backofficeGetCategories: backofficeGetCategories,
    backofficeCreateCategory: backofficeCreateCategory,
    backofficeGetCategoryById: backofficeGetCategoryById,
    backofficeUpdateCategory: backofficeUpdateCategory,
    backofficeDeleteCategory: backofficeDeleteCategory,
  };
}
