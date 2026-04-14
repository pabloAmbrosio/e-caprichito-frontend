import type { UserDeleted } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function deleteUser(id: string): Promise<UserDeleted> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/users/${id}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response);
}
