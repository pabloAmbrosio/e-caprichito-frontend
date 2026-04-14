import type { BackofficePayment } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeReviewPayment(
  id: string,
  action: 'APPROVE' | 'REJECT',
  note?: string,
): Promise<BackofficePayment> {
  const body: { action: string; note?: string } = { action };
  if (note !== undefined) body.note = note;
  const response = await authFetch(`${BASE_URL}/api/backoffice/payments/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleApiResponse(response);
}
