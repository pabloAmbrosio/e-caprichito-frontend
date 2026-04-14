import { useState, useCallback } from 'react';
import { createPaymentApi } from '../infrastructure/paymentApi';
import type { BackofficePayment } from '../domain/types';

const api = createPaymentApi();

interface State {
  payment: BackofficePayment | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useBackofficePaymentDetail() {
  const [state, setState] = useState<State>({
    payment: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const fetchPayment = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeGetById(id);
      setState({ payment: data, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el pago';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const reviewPayment = useCallback(async (
    id: string,
    action: 'APPROVE' | 'REJECT',
    note?: string,
  ) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const updated = await api.backofficeReview(id, action, note);
      setState({ payment: updated, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al revisar el pago';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  return { ...state, fetchPayment, reviewPayment };
}
