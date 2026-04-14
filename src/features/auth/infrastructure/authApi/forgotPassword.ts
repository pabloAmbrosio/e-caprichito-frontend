import { BASE_URL } from '@/shared/utils/apiConfig';
import type { ForgotPasswordResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function forgotPassword(identifier: string): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier }),
  });
  return handleResponse<ForgotPasswordResponse>(response);
}
