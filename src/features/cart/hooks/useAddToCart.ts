import { useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth';
import { useCartStore } from '../store/cartStore';
import { useGuestCartStore } from '../store/guestCartStore';
import { createCartApi } from '../infrastructure/cartApi';

const cartApi = createCartApi();

export interface AddToCartProduct {
  id: string;
  variantId: string;
  slug: string;
  title: string;
  image: string;
  priceMin: number;
}

/**
 * Returns a function to add a product to the cart (1 unit).
 * If authenticated: calls the backend API.
 * If not authenticated: adds to guest cart (localStorage) and opens the drawer.
 */
export function useAddToCart() {
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const addToCart = useCallback(async (product: AddToCartProduct) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      useGuestCartStore.getState().addItem({
        productId: product.variantId,
        quantity: 1,
        title: product.title,
        image: product.image,
        unitPrice: product.priceMin,
        slug: product.slug,
      });
      useCartStore.getState().openDrawer();
      setSuccessId(product.id);
      setTimeout(() => setSuccessId(null), 1500);
      return;
    }

    setAddingId(product.id);
    try {
      const updatedCart = await cartApi.addItem(product.variantId, 1);
      useCartStore.getState().setCart(updatedCart);
      setSuccessId(product.id);
      setTimeout(() => setSuccessId(null), 1500);
    } catch (err) {
      console.error('[useAddToCart] failed', err);
    } finally {
      setAddingId(null);
    }
  }, []);

  return { addToCart, addingId, successId };
}
