import type { BackofficeCart } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeGetCartById(cartId: string): Promise<BackofficeCart> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/carts/${cartId}`);
  return handleApiResponse(response);
}
