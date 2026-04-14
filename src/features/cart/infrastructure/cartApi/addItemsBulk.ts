import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function addItemsBulk(
  items: Array<{ productId: string; quantity: number }>,
): Promise<CartWithPromotions> {
  const response = await authFetch(`${BASE_URL}/api/cart/items/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return handleApiResponse(response) as Promise<CartWithPromotions>;
}
