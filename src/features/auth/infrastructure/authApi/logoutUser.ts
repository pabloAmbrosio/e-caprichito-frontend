import { BASE_URL } from '@/shared/utils/apiConfig';
import type { SimpleResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function logoutUser(): Promise<SimpleResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse<SimpleResponse>(response);
}
