import type { ListUsersQuery, UserListItem } from '../../domain/types';
import type { ApiError } from '@/shared/types/api';
import { authFetch } from '@/features/auth';
import { FeatureApiError } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

// Note: /api/backoffice/users returns { success, msg, data: UserListItem[], pagination: {...} }
// where pagination is a top-level sibling of data, not nested inside it.
// This differs from other endpoints that use { data: { items, pagination } }.
export async function listUsers(
  query?: ListUsersQuery,
): Promise<{ items: UserListItem[]; pagination: unknown }> {
  const params = new URLSearchParams();
  if (query?.page !== undefined) params.set('page', String(query.page));
  if (query?.limit !== undefined) params.set('limit', String(query.limit));
  if (query?.adminRole) params.set('adminRole', query.adminRole);
  if (query?.customerRole) params.set('customerRole', query.customerRole);
  if (query?.search) params.set('search', query.search);
  if (query?.sortBy) params.set('sortBy', query.sortBy);
  if (query?.sortOrder) params.set('sortOrder', query.sortOrder);
  if (query?.includeDeleted) params.set('includeDeleted', 'true');
  const qs = params.toString();
  const response = await authFetch(`${BASE_URL}/api/backoffice/users${qs ? `?${qs}` : ''}`);
  const json = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    const error = json as unknown as ApiError;
    const message = error.code ?? error.error ?? `Error ${response.status}`;
    throw new FeatureApiError(message, response.status, error.code);
  }
  const items = Array.isArray(json.data) ? (json.data as UserListItem[]) : [];
  return { items, pagination: json.pagination ?? null };
}
