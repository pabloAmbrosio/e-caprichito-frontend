import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function removeCoupon(): Promise<CartWithPromotions> {
  const response = await authFetch(`${BASE_URL}/api/cart/coupon`, {
    method: 'DELETE',
  });
  return handleApiResponse(response) as Promise<CartWithPromotions>;
}
