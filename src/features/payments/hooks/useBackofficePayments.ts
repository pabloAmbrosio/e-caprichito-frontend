import { useState, useCallback } from 'react';
import { createPaymentApi } from '../infrastructure/paymentApi';
import type { BackofficePayment } from '../domain/types';
import type { PaymentStatus } from '@/shared/types/enums';

const api = createPaymentApi();

interface State {
  payments: BackofficePayment[];
  pagination: unknown;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficePayments() {
  const [state, setState] = useState<State>({
    payments: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchPayments = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
  }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeList(params);
      setState({ payments: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar pagos';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  return { ...state, fetchPayments };
}
