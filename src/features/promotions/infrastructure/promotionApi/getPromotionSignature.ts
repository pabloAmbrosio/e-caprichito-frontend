import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  transformation?: string;
}

export async function getPromotionSignature(): Promise<CloudinarySignature> {
  const response = await authFetch(`${BASE_URL}/api/uploads/promotion-signature`, {
    method: 'POST',
  });
  return handleApiResponse(response);
}
