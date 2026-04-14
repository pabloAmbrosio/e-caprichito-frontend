import { useState, useCallback } from 'react';
import { createUserApi } from '../infrastructure/userApi';
import type { UserListItem } from '../domain/types';
import type { AdminRole, CustomerRole } from '@/shared/types/enums';

const api = createUserApi();

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  adminRole?: AdminRole;
  customerRole?: CustomerRole;
  includeDeleted?: boolean;
}

interface State {
  users: UserListItem[];
  pagination: unknown;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeUsers() {
  const [state, setState] = useState<State>({
    users: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchUsers = useCallback(async (params?: FetchUsersParams) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.list(params);
      setState({ users: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  return { ...state, fetchUsers };
}
