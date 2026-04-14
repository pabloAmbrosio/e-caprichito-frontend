import { BASE_URL } from '@/shared/utils/apiConfig';
import type { CheckIdentifierResponse } from '../../domain/types';
import { handleResponse } from './AuthApiError';

export async function checkIdentifier(identifier: string): Promise<CheckIdentifierResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/check-identifier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier }),
  });
  return handleResponse<CheckIdentifierResponse>(response);
}
