import { BASE_URL } from '@/shared/utils/apiConfig';
import type { SimpleResponse, ResetPasswordInput } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function resetPassword(input: ResetPasswordInput): Promise<SimpleResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return handleResponse<SimpleResponse>(response);
}
