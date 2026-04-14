import type { BackofficeCancelOrderResult } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeCancelOrder(
  orderId: string,
  reason?: string,
): Promise<BackofficeCancelOrderResult> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/order/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reason ? { reason } : {}),
  });
  return handleApiResponse(response);
}
