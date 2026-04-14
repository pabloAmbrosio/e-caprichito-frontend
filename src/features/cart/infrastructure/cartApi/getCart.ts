import type { CartWithPromotions } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getCart(): Promise<CartWithPromotions | null> {
  const response = await authFetch(`${BASE_URL}/api/cart`);
  const data = await handleApiResponse(response) as CartWithPromotions | null;
  return data;
}
