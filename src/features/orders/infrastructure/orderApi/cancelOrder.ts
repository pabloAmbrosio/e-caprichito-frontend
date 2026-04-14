import type { CancelOrderResult } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  const response = await authFetch(`${BASE_URL}/api/order/${orderId}/cancel`, {
    method: 'PATCH',
  });
  return handleApiResponse(response);
}
