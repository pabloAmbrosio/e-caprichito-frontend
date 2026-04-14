import { BASE_URL } from '@/shared/utils/apiConfig';
import type { OtpResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function requestOtp(phone: string): Promise<OtpResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ phone }),
  });
  return handleResponse<OtpResponse>(response);
}
