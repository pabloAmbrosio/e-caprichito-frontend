import { useState, useCallback } from 'react';
import { createProductApi } from '../infrastructure/productApi';
import type {
  BackofficeProductDetail,
  InitializeProductInput,
  UpdateProductInput,
  VariantInput,
} from '../domain/types';
import type { ProductStatus } from '@/shared/types/enums';

const api = createProductApi();

interface UseBackofficeProductDetailState {
  product: BackofficeProductDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useBackofficeProductDetail() {
  const [state, setState] = useState<UseBackofficeProductDetailState>({
    product: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const fetchProduct = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const product = await api.backofficeGetById(id);
      setState({ product, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar producto';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const createProduct = useCallback(async (input: InitializeProductInput): Promise<BackofficeProductDetail> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const product = await api.backofficeCreate(input);
      setState((s) => ({ ...s, product, isSaving: false }));
      return product;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear producto';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput): Promise<BackofficeProductDetail> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const product = await api.backofficeUpdate(id, input);
      setState((s) => ({ ...s, product, isSaving: false }));
      return product;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar producto';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: ProductStatus): Promise<void> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const product = await api.backofficeUpdateStatus(id, status);
      setState((s) => ({ ...s, product, isSaving: false }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const addVariants = useCallback(async (id: string, variants: VariantInput[]): Promise<void> => {
    const product = await api.backofficeAddVariants(id, variants);
    setState((s) => ({ ...s, product }));
  }, []);

  const deleteVariant = useCallback(async (productId: string, variantId: string): Promise<void> => {
    await api.backofficeDeleteVariant(productId, variantId);
    setState((s) => ({
      ...s,
      product: s.product
        ? { ...s.product, variants: s.product.variants.filter((v) => v.id !== variantId) }
        : null,
    }));
  }, []);

  return {
    ...state,
    fetchProduct,
    createProduct,
    updateProduct,
    updateStatus,
    addVariants,
    deleteVariant,
  };
}
