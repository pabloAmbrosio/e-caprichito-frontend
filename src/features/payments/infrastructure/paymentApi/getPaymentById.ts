import type { Payment } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getPaymentById(id: string): Promise<Payment> {
  const response = await authFetch(`${BASE_URL}/api/payments/${id}`);
  return handleApiResponse(response);
}
