import type { Payment } from '../../domain/types';
import type { PaymentStatus } from '@/shared/types/enums';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function listPayments(params?: {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}): Promise<{ items: Payment[]; pagination: unknown }> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status as string);
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/payments${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
