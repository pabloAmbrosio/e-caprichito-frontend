import { useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth';
import { useCartStore } from '../store/cartStore';
import { useGuestCartStore } from '../store/guestCartStore';
import { createCartApi } from '../infrastructure/cartApi';
import { getVariantId } from '../domain/types';

const cartApi = createCartApi();

/**
 * Returns a function to update the quantity of a cart item.
 * Guest: updates localStorage directly (synchronous).
 * Authenticated: optimistic update + API call.
 */
export function useUpdateCartItem() {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      useGuestCartStore.getState().updateQuantity(productId, newQuantity);
      return;
    }

    const store = useCartStore.getState();
    const previousCart = store.cart;
    if (!previousCart) return;

    // Optimistic update — match by variant UUID (works for both GET and PATCH response shapes)
    const optimisticItems = previousCart.items.map((item) =>
      getVariantId(item) === productId
        ? { ...item, quantity: newQuantity }
        : item,
    );
    store.setCart({ ...previousCart, items: optimisticItems });

    setUpdatingId(productId);
    try {
      // productId is always the variant UUID (from DrawerDisplayItem.productId via getVariantId)
      const updatedCart = await cartApi.updateItem(productId, newQuantity);
      useCartStore.getState().setCart(updatedCart);
    } catch (err) {
      console.error('[useUpdateCartItem] failed, reverting', err);
      useCartStore.getState().setCart(previousCart);
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return { updateQuantity, updatingId };
}
