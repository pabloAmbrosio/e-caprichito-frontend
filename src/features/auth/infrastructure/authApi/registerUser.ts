import { BASE_URL } from '@/shared/utils/apiConfig';
import type { AuthResponse, RegisterInput } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return handleResponse<AuthResponse>(response);
}
