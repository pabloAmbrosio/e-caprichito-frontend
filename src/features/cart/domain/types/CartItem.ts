export interface CartItemProductImage {
  imageUrl: string;
  thumbnailUrl: string;
}

export interface CartItemAbstractProduct {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  tags: string[];
}

export interface CartItemProduct {
  id: string;
  title: string;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  // GET /api/cart shape
  images?: CartItemProductImage[] | null;
  deletedAt?: string | null;
  abstractProduct?: CartItemAbstractProduct | null;
  // PATCH/DELETE response shape
  slug?: string;
  thumbnailUrl?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  /** Variant UUID — present in GET /api/cart response */
  productId?: string;
  /** Variant UUID — present in PATCH/DELETE response */
  selectedVariantId?: string;
  product: CartItemProduct;
}

/** Returns the variant UUID regardless of which endpoint shape the item came from */
export function getVariantId(item: CartItem): string {
  return item.selectedVariantId ?? item.productId ?? item.product.id;
}
