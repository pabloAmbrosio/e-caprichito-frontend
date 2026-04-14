import { useState, useCallback } from 'react';
import { createProductApi } from '../infrastructure/productApi';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../domain/types';

const api = createProductApi();

interface UseBackofficeCategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeCategories() {
  const [state, setState] = useState<UseBackofficeCategoriesState>({
    categories: [],
    isLoading: false,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeGetCategories('all');
      setState({ categories: data.flat, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar categorías';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const createCategory = useCallback(async (input: CreateCategoryInput): Promise<Category> => {
    const category = await api.backofficeCreateCategory(input);
    setState((s) => ({ ...s, categories: [...s.categories, category] }));
    return category;
  }, []);

  const updateCategory = useCallback(async (id: string, input: UpdateCategoryInput): Promise<Category> => {
    const updated = await api.backofficeUpdateCategory(id, input);
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    await api.backofficeDeleteCategory(id);
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }, []);

  const getCategoryById = useCallback(async (id: string): Promise<Category> => {
    return api.backofficeGetCategoryById(id);
  }, []);

  return {
    ...state,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
