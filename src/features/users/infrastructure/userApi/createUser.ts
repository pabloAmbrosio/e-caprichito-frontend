import type { CreateUserInput, UserPublic } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function createUser(input: CreateUserInput): Promise<UserPublic> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleApiResponse(response);
}
