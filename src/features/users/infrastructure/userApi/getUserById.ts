import type { UserDetail } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function getUserById(id: string): Promise<UserDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/users/${id}`);
  return handleApiResponse(response);
}
