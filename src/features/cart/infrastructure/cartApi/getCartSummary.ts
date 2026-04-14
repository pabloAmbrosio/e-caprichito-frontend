import type { CartSummary } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getCartSummary(): Promise<CartSummary | null> {
  const response = await authFetch(`${BASE_URL}/api/cart/summary`);
  return handleApiResponse(response);
}
