/** Promo de producto — bento grid con link a /productos */
export interface ProductBanner {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  endsAt: string | null;
  requiredRole: string | null;
  isFirstPurchaseOnly: boolean;
  action: {
    type: 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y';
    value: string;
  };
  filters: {
    categoryIds: string[];
    tags: string[];
    productIds: string[];
  };
}

/** Promo de carrito — mini banner / header */
export interface CartBanner {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  endsAt: string | null;
}

/** Cupón — sección especial */
export interface CouponBanner {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  couponCode: string;
  endsAt: string | null;
}

/** Response completa del endpoint GET /api/promotions/banners */
export interface BannersResponse {
  product: ProductBanner[];
  cart: CartBanner[];
  coupons: CouponBanner[];
}
