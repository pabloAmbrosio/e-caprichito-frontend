import { useState, useCallback } from 'react';
import { createOrderApi } from '../infrastructure/orderApi';
import type { BackofficeOrderListItem } from '../domain/types';
import type { OrderStatus } from '@/shared/types/enums';
import type { Pagination } from '@/shared/types/api';

const api = createOrderApi();

interface State {
  orders: BackofficeOrderListItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeOrders() {
  const [state, setState] = useState<State>({
    orders: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchOrders = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    customerName?: string;
    productName?: string;
  }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeList(params);
      setState({ orders: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar órdenes';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  return { ...state, fetchOrders };
}
