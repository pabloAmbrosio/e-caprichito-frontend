import { useState, useCallback } from 'react';
import { createPromotionApi } from '../infrastructure/promotionApi';
import type { PromotionWithCount } from '../domain/types';

const api = createPromotionApi();

interface State {
  promotions: PromotionWithCount[];
  pagination: unknown;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficePromotions() {
  const [state, setState] = useState<State>({
    promotions: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchPromotions = useCallback(async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.list(params);
      setState({ promotions: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar promociones';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const deletePromotion = useCallback(async (id: string): Promise<void> => {
    await api.delete(id);
    setState((s) => ({ ...s, promotions: s.promotions.filter((p) => p.id !== id) }));
  }, []);

  return { ...state, fetchPromotions, deletePromotion };
}
