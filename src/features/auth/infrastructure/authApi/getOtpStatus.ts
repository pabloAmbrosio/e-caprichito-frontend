import { BASE_URL } from '@/shared/utils/apiConfig';
import type { OtpStatusResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function getOtpStatus(accessToken: string): Promise<OtpStatusResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/otp-status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  return handleResponse<OtpStatusResponse>(response);
}
