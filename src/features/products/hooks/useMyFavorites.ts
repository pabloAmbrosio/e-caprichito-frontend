import { useState, useEffect, useCallback } from 'react';
import { createProductApi } from '../infrastructure/productApi';
import { mapLikedToCardData } from '../application/mapLikedToCardData';
import { useLikedStore } from '../store/likedStore';
import type { ProductCardData } from '../application/mapProductsToCardData';

const productApi = createProductApi();

interface UseMyFavoritesReturn {
  favorites: ProductCardData[];
  total: number;
  isLoading: boolean;
  error: string | null;
  unlike: (productId: string) => Promise<void>;
  loadMore: () => void;
  hasMore: boolean;
}

export function useMyFavorites(limit = 20): UseMyFavoritesReturn {
  const [favorites, setFavorites] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(
    async (currentOffset: number, replace = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productApi.getLiked({ limit, offset: currentOffset });
        const mapped = mapLikedToCardData(result.items);
        setFavorites((prev) => (replace ? mapped : [...prev, ...mapped]));
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    void fetchFavorites(0, true);
    setOffset(0);
  }, [fetchFavorites]);

  // Sync: when a product is unliked from elsewhere (e.g. ProductCard),
  // remove it from the local favorites list
  const likedIds = useLikedStore((s) => s.ids);
  useEffect(() => {
    setFavorites((prev) => {
      const filtered = prev.filter((f) => likedIds.has(f.id));
      if (filtered.length !== prev.length) {
        setTotal((t) => Math.max(0, t - (prev.length - filtered.length)));
      }
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [likedIds]);

  const unlike = useCallback(
    async (productId: string) => {
      await productApi.unlike(productId);
      // Remove from local state and global liked store
      setFavorites((prev) => prev.filter((f) => f.id !== productId));
      setTotal((prev) => Math.max(0, prev - 1));
      useLikedStore.getState().remove(productId);
    },
    [],
  );

  const loadMore = useCallback(() => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    void fetchFavorites(nextOffset);
  }, [offset, limit, fetchFavorites]);

  const hasMore = favorites.length < total;

  return { favorites, total, isLoading, error, unlike, loadMore, hasMore };
}
