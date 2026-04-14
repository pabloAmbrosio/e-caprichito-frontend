import type { BackofficeShipmentDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeAdvanceShipment(
  id: string,
  note?: string,
): Promise<BackofficeShipmentDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/shipments/${id}/advance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note ? { note } : {}),
  });
  return handleApiResponse(response);
}
