import { BASE_URL } from '@/shared/utils/apiConfig';

export function getGoogleOAuthUrl(): string {
  return `${BASE_URL}/api/auth/google`;
}
