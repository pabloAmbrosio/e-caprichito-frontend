import type { CalculateFeeResult } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function calculateDeliveryFee(addressId: string): Promise<CalculateFeeResult> {
  const response = await authFetch(`${BASE_URL}/api/shipments/calculate-fee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addressId }),
  });
  return handleApiResponse(response);
}
