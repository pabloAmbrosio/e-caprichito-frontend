import type { Promotion } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function deletePromotion(id: string): Promise<Promotion> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/promotions/${id}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
