import { BASE_URL } from '@/shared/utils/apiConfig';
import type { AuthResponse, VerifyPhoneInput } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function verifyPhone(input: VerifyPhoneInput): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/verify-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return handleResponse<AuthResponse>(response);
}
