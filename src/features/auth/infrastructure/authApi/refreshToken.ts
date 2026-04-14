import { BASE_URL } from '@/shared/utils/apiConfig';
import type { RefreshResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function refreshToken(accessToken: string | null): Promise<RefreshResponse> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  return handleResponse<RefreshResponse>(response);
}
