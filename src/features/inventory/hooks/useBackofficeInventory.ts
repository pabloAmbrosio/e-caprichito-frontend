import { useState, useCallback } from 'react';
import { createInventoryApi } from '../infrastructure/inventoryApi';
import type { InventoryWithProduct } from '../domain/types';
import type { Pagination } from '@/shared/types/api';

const api = createInventoryApi();

interface State {
  inventory: InventoryWithProduct[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeInventory() {
  const [state, setState] = useState<State>({
    inventory: [],
    pagination: null,
    isLoading: true,
    error: null,
  });

  const fetchInventory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    outOfStock?: boolean;
  }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.list(params);
      setState({ inventory: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar inventario';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const createInventory = useCallback(async (productId: string, physicalStock: number) => {
    const item = await api.create(productId, physicalStock);
    return item;
  }, []);

  return { ...state, fetchInventory, createInventory };
}
