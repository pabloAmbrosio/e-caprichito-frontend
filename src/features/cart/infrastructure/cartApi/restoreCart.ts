import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function restoreCart(cartId: string): Promise<CartWithPromotions | null> {
  const response = await authFetch(`${BASE_URL}/api/carts/${cartId}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId }),
  });
  return handleApiResponse(response) as Promise<CartWithPromotions | null>;
}
