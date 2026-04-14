import type { CreateOrderResult, CreateOrderPayload } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const response = await authFetch(`${BASE_URL}/api/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleApiResponse(response);
}
