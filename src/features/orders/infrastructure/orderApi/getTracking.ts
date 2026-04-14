import type { Shipment } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getTracking(orderId: string): Promise<Shipment> {
  const response = await authFetch(`${BASE_URL}/api/shipments/${orderId}/tracking`);
  return handleApiResponse(response);
}
