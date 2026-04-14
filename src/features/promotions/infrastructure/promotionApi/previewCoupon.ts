import type { CouponPreview } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function previewCoupon(couponCode: string): Promise<CouponPreview> {
  const response = await authFetch(`${BASE_URL}/api/promotions/apply-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponCode }),
  });
  return handleApiResponse(response);
}
