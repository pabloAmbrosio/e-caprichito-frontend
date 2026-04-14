import { useState, useCallback } from 'react';
import { createOrderApi } from '../infrastructure/orderApi';
import type { BackofficeOrderDetail, BackofficeCancelOrderResult } from '../domain/types';

const api = createOrderApi();

interface State {
  order: BackofficeOrderDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useBackofficeOrderDetail() {
  const [state, setState] = useState<State>({
    order: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const fetchOrder = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeGetById(id);
      setState({ order: data, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la orden';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const cancelOrder = useCallback(async (
    id: string,
    reason?: string,
  ): Promise<BackofficeCancelOrderResult> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const result = await api.backofficeCancelOrder(id, reason);
      setState((s) =>
        s.order
          ? { ...s, isSaving: false, order: { ...s.order, status: 'CANCELLED' } }
          : { ...s, isSaving: false },
      );
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar la orden';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  return { ...state, fetchOrder, cancelOrder };
}
