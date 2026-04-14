import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth';
import { getBySlugOrId } from '@/features/products';
import { useCartStore } from '../store/cartStore';
import { useGuestCartStore } from '../store/guestCartStore';
import { createCartApi } from '../infrastructure/cartApi';

const cartApi = createCartApi();

/**
 * Hydrates the cart store when the user is authenticated.
 * Merges guest cart items on login via addItemsBulk.
 * Clears the auth cart on logout. Call ONLY from _app.tsx.
 */
export function useCartInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Hydrate guest cart from localStorage on mount, then rectify prices from backend
  useEffect(() => {
    useGuestCartStore.getState().hydrate();

    const items = useGuestCartStore.getState().items;
    const itemsWithSlug = items.filter((item) => item.slug);
    if (itemsWithSlug.length === 0) return;

    const uniqueSlugs = [...new Set(itemsWithSlug.map((i) => i.slug!))];

    void Promise.allSettled(uniqueSlugs.map((slug) => getBySlugOrId(slug))).then(
      (results) => {
        const updates: { productId: string; unitPrice: number }[] = [];

        results.forEach((result, i) => {
          if (result.status !== 'fulfilled') return;
          const product = result.value;
          itemsWithSlug
            .filter((item) => item.slug === uniqueSlugs[i])
            .forEach((item) => {
              const variant = product.variants.find((v) => v.id === item.productId);
              if (variant) {
                updates.push({ productId: item.productId, unitPrice: variant.priceInCents / 100 });
              }
            });
        });

        if (updates.length > 0) {
          useGuestCartStore.getState().refreshItemPrices(updates);
        }
      },
    );
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      const guestItems = useGuestCartStore.getState().items;
      useCartStore.getState().setLoading(true);

      if (guestItems.length > 0) {
        // Merge guest cart into backend
        cartApi
          .addItemsBulk(
            guestItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          )
          .then((cart) => {
            useCartStore.getState().setCart(cart);
            useGuestCartStore.getState().clear();
          })
          .catch((err) => {
            console.error('[useCartInit] merge failed, fetching existing cart', err);
            // Clear guest cart to avoid retrying with invalid products
            useGuestCartStore.getState().clear();
            return cartApi.get().then((cart) => {
              useCartStore.getState().setCart(cart);
            });
          })
          .finally(() => {
            useCartStore.getState().setLoading(false);
          });
      } else {
        // Normal flow: fetch cart from backend
        cartApi
          .get()
          .then((cart) => {
            useCartStore.getState().setCart(cart);
          })
          .catch((err) => {
            console.error('[useCartInit] failed to fetch cart', err);
          })
          .finally(() => {
            useCartStore.getState().setLoading(false);
          });
      }
    } else {
      useCartStore.getState().clearCart();
    }
  }, [isAuthenticated, isLoading]);
}
