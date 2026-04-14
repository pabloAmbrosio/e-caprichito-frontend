import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function updateItem(
  productId: string,
  quantity: number,
): Promise<CartWithPromotions> {
  const response = await authFetch(`${BASE_URL}/api/cart/items/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  return handleApiResponse(response) as Promise<CartWithPromotions>;
}
