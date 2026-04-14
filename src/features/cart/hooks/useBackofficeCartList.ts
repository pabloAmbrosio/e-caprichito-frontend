import { useState, useCallback } from 'react';
import { createCartApi } from '../infrastructure/cartApi';
import type { BackofficeCart, AbandonedCart } from '../domain/types';
import type { Pagination } from '@/shared/types/api';

const api = createCartApi();

interface CartListState {
  carts: BackofficeCart[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

interface AbandonedState {
  abandoned: AbandonedCart[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeCartList() {
  const [cartState, setCartState] = useState<CartListState>({
    carts: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const [abandonedState, setAbandonedState] = useState<AbandonedState>({
    abandoned: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCarts = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    setCartState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeList(params);
      setCartState({ carts: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar carritos';
      setCartState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const fetchAbandoned = useCallback(async (params?: {
    page?: number;
    limit?: number;
    inactiveDays?: number;
    minItems?: number;
  }) => {
    setAbandonedState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeListAbandoned(params);
      setAbandonedState({ abandoned: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar carritos abandonados';
      setAbandonedState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const deleteCart = useCallback(async (cartId: string) => {
    setIsDeleting(true);
    try {
      await api.backofficeDelete(cartId);
      setCartState((s) => ({ ...s, carts: s.carts.filter((c) => c.id !== cartId) }));
      setAbandonedState((s) => ({ ...s, abandoned: s.abandoned.filter((c) => c.id !== cartId) }));
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    ...cartState,
    abandoned: abandonedState.abandoned,
    abandonedPagination: abandonedState.pagination,
    isLoadingAbandoned: abandonedState.isLoading,
    abandonedError: abandonedState.error,
    isDeleting,
    fetchCarts,
    fetchAbandoned,
    deleteCart,
  };
}
