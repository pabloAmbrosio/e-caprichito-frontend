import { BASE_URL } from '@/shared/utils/apiConfig';
import type { AuthResponse, LoginInput } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return handleResponse<AuthResponse>(response);
}
