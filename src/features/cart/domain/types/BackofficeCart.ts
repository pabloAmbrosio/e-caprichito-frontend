export interface BackofficeCartItem {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    title: string;
    priceInCents: number;
    deletedAt: string | null;
    abstractProduct: {
      categoryId: string;
      tags: string[];
    };
  };
}

export interface BackofficeCart {
  id: string;
  customerId: string;
  couponCode: string | null;
  items: BackofficeCartItem[];
  activeFor: unknown | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface AbandonedCart {
  id: string;
  customerId: string;
  couponCode: string | null;
  items: BackofficeCartItem[];
  customer: { id: string; username: string; email: string };
  updatedAt: string;
  createdAt: string;
  _count: { items: number };
}
