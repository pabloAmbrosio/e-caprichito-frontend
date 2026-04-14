import { useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth';
import { useCartStore } from '../store/cartStore';
import { useGuestCartStore } from '../store/guestCartStore';
import { createCartApi } from '../infrastructure/cartApi';
import { getVariantId } from '../domain/types';

const cartApi = createCartApi();

/**
 * Returns a function to remove an item from the cart.
 * Guest: removes from localStorage directly (synchronous).
 * Authenticated: optimistic update + API call.
 */
export function useRemoveCartItem() {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const removeItem = useCallback(async (productId: string) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      useGuestCartStore.getState().removeItem(productId);
      return;
    }

    const store = useCartStore.getState();
    const previousCart = store.cart;
    if (!previousCart) return;

    // Optimistic: remove by variant UUID (works for both GET and PATCH response shapes)
    const optimisticItems = previousCart.items.filter((item) => getVariantId(item) !== productId);
    store.setCart({ ...previousCart, items: optimisticItems });

    setRemovingId(productId);
    try {
      // productId is always the variant UUID (from DrawerDisplayItem.productId via getVariantId)
      const updatedCart = await cartApi.removeItem(productId);
      useCartStore.getState().setCart(updatedCart);
    } catch (err) {
      console.error('[useRemoveCartItem] failed, reverting', err);
      useCartStore.getState().setCart(previousCart);
    } finally {
      setRemovingId(null);
    }
  }, []);

  return { removeItem, removingId };
}
