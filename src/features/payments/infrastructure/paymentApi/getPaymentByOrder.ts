import type { Payment } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

interface PaymentInfoLastPayment {
  id: string;
  status: Payment['status'];
  amount: number;
  method: Payment['method'];
}

interface PaymentInfoResponse {
  lastPayment: PaymentInfoLastPayment | null;
}

/**
 * Gets the payment associated with an order using the customer-accessible
 * payment-info endpoint. Returns null if no payment exists yet.
 */
export async function getPaymentByOrder(orderId: string): Promise<Payment | null> {
  const response = await authFetch(`${BASE_URL}/api/order/${orderId}/payment-info`);
  const data = await handleApiResponse<PaymentInfoResponse>(response);

  if (!data.lastPayment) return null;

  return {
    id: data.lastPayment.id,
    orderId,
    customerId: '',
    method: data.lastPayment.method,
    status: data.lastPayment.status,
    amount: data.lastPayment.amount,
    currency: 'MXN',
    providerData: null,
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    createdAt: '',
    updatedAt: '',
  };
}
