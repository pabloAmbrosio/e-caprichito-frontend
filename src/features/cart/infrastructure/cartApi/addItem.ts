import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function addItem(
  productId: string,
  quantity: number,
): Promise<CartWithPromotions> {
  const response = await authFetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  return handleApiResponse(response) as Promise<CartWithPromotions>;
}
