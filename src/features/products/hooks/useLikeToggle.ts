import { useState, useCallback } from 'react';
import { useLikedStore } from '../store/likedStore';
import { createProductApi } from '../infrastructure/productApi';

const productApi = createProductApi();

interface UseLikeToggleReturn {
  isLiked: boolean;
  toggle: () => Promise<void>;
  isToggling: boolean;
}

export function useLikeToggle(productId: string): UseLikeToggleReturn {
  const isLiked = useLikedStore((s) => s.ids.has(productId));
  const add = useLikedStore((s) => s.add);
  const remove = useLikedStore((s) => s.remove);
  const [isToggling, setIsToggling] = useState(false);

  const toggle = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);

    // Optimistic update
    if (isLiked) {
      remove(productId);
    } else {
      add(productId);
    }

    try {
      if (isLiked) {
        await productApi.unlike(productId);
      } else {
        await productApi.like(productId);
      }
    } catch {
      // Revert on failure
      if (isLiked) {
        add(productId);
      } else {
        remove(productId);
      }
    } finally {
      setIsToggling(false);
    }
  }, [productId, isLiked, isToggling, add, remove]);

  return { isLiked, toggle, isToggling };
}
