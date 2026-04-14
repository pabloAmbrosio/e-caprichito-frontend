import type { BackofficePayment } from '../../domain/types';
import type { PaymentStatus } from '@/shared/types/enums';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeListPayments(params?: {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}): Promise<{ items: BackofficePayment[]; pagination: unknown }> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status as string);
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/backoffice/payments${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
