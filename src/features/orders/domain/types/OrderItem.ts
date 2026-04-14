export interface ProductImage {
  imageUrl: string;
  thumbnailUrl: string;
  alt?: string;
  order?: number;
}

export interface OrderItemProduct {
  id: string;
  title: string;
  priceInCents: number;
  images: ProductImage[] | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  product: OrderItemProduct;
}
