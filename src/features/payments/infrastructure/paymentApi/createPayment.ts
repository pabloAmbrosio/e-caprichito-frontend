import type { Payment } from '../../domain/types';
import type { PaymentMethod } from '@/shared/types/enums';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function createPayment(
  orderId: string,
  method: PaymentMethod,
): Promise<Payment> {
  const response = await authFetch(`${BASE_URL}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, method }),
  });
  return handleApiResponse(response);
}
