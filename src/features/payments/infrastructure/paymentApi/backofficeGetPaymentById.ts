import type { BackofficePayment } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeGetPaymentById(id: string): Promise<BackofficePayment> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/payments/${id}`);
  return handleApiResponse(response);
}
