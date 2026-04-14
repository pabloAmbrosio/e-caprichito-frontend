import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function applyCoupon(couponCode: string): Promise<CartWithPromotions> {
  const response = await authFetch(`${BASE_URL}/api/cart/coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponCode }),
  });
  return handleApiResponse(response) as Promise<CartWithPromotions>;
}
