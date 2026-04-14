import type { BackofficeShipmentDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export interface UpdateShipmentPayload {
  carrier?: string;
  trackingCode?: string;
  estimatedAt?: string;
}

export async function backofficeUpdateShipment(
  id: string,
  payload: UpdateShipmentPayload,
): Promise<BackofficeShipmentDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/shipments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleApiResponse(response);
}
