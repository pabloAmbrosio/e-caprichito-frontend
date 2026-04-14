import type { UserPublic } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function restoreUser(id: string): Promise<UserPublic> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/users/${id}/restore`, {
    method: 'PATCH',
  });
  return handleApiResponse(response);
}
