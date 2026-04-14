import type { BackofficeOrderDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeGetOrderById(
  orderId: string,
): Promise<BackofficeOrderDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/order/${orderId}`);
  return handleApiResponse(response);
}
