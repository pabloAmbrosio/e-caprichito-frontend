import { BASE_URL } from '@/shared/utils/apiConfig';
import type { OtpResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function addPhone(phone: string, accessToken: string): Promise<OtpResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/add-phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify({ phone }),
  });
  return handleResponse<OtpResponse>(response);
}
