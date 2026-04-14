import type { UpdateUserInput, UserPublic } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserPublic> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
