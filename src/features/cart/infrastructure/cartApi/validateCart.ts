import type { CartValidation } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function validateCart(): Promise<CartValidation> {
  const response = await authFetch(`${BASE_URL}/api/cart/validate`);
  return handleApiResponse(response);
}
