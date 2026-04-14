import { useState, useEffect, useCallback } from 'react';
import { createOrderApi } from '../infrastructure/orderApi';
import type { MyOrder, CancelOrderResult } from '../domain/types';
import type { Pagination } from '@/shared/types/api';

const orderApi = createOrderApi();

interface UseMyOrdersState {
  orders: MyOrder[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

interface UseMyOrdersReturn extends UseMyOrdersState {
  page: number;
  setPage: (page: number) => void;
  cancelOrder: (orderId: string) => Promise<CancelOrderResult>;
  refresh: () => Promise<void>;
}

export function useMyOrders(limit = 10): UseMyOrdersReturn {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<UseMyOrdersState>({
    orders: [],
    pagination: null,
    isLoading: true,
    error: null,
  });

  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await orderApi.list({ page, limit });
      setState({
        orders: result.items,
        pagination: result.pagination,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar pedidos',
      }));
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = useCallback(
    async (orderId: string): Promise<CancelOrderResult> => {
      const result = await orderApi.cancel(orderId);
      void fetchOrders();
      return result;
    },
    [fetchOrders],
  );

  return {
    ...state,
    page,
    setPage,
    cancelOrder,
    refresh: fetchOrders,
  };
}
