import type { Payment } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function uploadProof(
  id: string,
  data: { screenshotUrl: string; bankReference?: string },
): Promise<Payment> {
  const response = await authFetch(`${BASE_URL}/api/payments/${id}/proof`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}
