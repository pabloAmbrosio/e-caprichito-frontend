import type { PaymentInfo } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getPaymentInfo(orderId: string): Promise<PaymentInfo> {
  const response = await authFetch(`${BASE_URL}/api/order/${orderId}/payment-info`);
  return handleApiResponse(response);
}
