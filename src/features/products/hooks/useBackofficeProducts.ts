import { useState, useCallback } from 'react';
import { createProductApi } from '../infrastructure/productApi';
import type { ProductListItem } from '../domain/types';
import type { ProductStatus } from '@/shared/types/enums';

const api = createProductApi();

interface UseBackofficeProductsState {
  products: ProductListItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

interface FetchProductsParams {
  title?: string;
  categoryIds?: string[];
  offset?: number;
  limit?: number;
}

export function useBackofficeProducts() {
  const [state, setState] = useState<UseBackofficeProductsState>({
    products: [],
    total: 0,
    isLoading: false,
    error: null,
  });

  const fetchProducts = useCallback(async (params?: FetchProductsParams) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.list({
        title: params?.title,
        categoryIds: params?.categoryIds,
        offset: params?.offset ?? 0,
        limit: params?.limit ?? 20,
        sort: [{ field: 'createdAt', direction: 'desc' }],
      });
      setState({ products: data.items, total: data.total, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar productos';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const updateProductStatus = useCallback(async (id: string, status: ProductStatus): Promise<void> => {
    await api.backofficeUpdateStatus(id, status);
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    await api.backofficeDelete(id);
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  }, []);

  return {
    ...state,
    fetchProducts,
    updateProductStatus,
    deleteProduct,
  };
}
