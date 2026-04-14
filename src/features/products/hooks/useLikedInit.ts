import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth';
import { useLikedStore } from '../store/likedStore';
import { createProductApi } from '../infrastructure/productApi';

const productApi = createProductApi();

/**
 * Hydrates the liked-IDs store when the user is authenticated.
 * Uses the lightweight /products/liked/ids endpoint (returns only IDs).
 * Clears it on logout. Call ONLY from _app.tsx.
 */
export function useLikedInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      productApi
        .getLikedIds()
        .then((ids) => {
          useLikedStore.getState().hydrate(ids);
        })
        .catch((err) => {
          console.error('[useLikedInit] failed to fetch liked IDs', err);
        });
    } else {
      useLikedStore.getState().clear();
    }
  }, [isAuthenticated, isLoading]);
}
