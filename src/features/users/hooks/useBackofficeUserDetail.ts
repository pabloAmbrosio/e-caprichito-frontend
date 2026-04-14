import { useState, useCallback } from 'react';
import { createUserApi } from '../infrastructure/userApi';
import type { UserDetail, CreateUserInput, UpdateUserInput } from '../domain/types';

const api = createUserApi();

interface State {
  user: UserDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useBackofficeUserDetail() {
  const [state, setState] = useState<State>({
    user: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const fetchUser = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.getById(id);
      setState({ user: data, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el usuario';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const createUser = useCallback(async (input: CreateUserInput): Promise<string> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const result = await api.create(input);
      setState((s) => ({ ...s, isSaving: false }));
      return result.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear el usuario';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, input: UpdateUserInput): Promise<void> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const updated = await api.update(id, input);
      setState((s) =>
        s.user
          ? { ...s, isSaving: false, user: { ...s.user, ...updated } as UserDetail }
          : { ...s, isSaving: false },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el usuario';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const result = await api.delete(id);
      setState((s) =>
        s.user
          ? { ...s, isSaving: false, user: { ...s.user, deletedAt: result.deletedAt } }
          : { ...s, isSaving: false },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el usuario';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const restoreUser = useCallback(async (id: string): Promise<void> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      await api.restore(id);
      setState((s) =>
        s.user
          ? { ...s, isSaving: false, user: { ...s.user, deletedAt: null } }
          : { ...s, isSaving: false },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al restaurar el usuario';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  return { ...state, fetchUser, createUser, updateUser, deleteUser, restoreUser };
}
