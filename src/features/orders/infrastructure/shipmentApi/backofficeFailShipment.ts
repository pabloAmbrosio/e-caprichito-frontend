import type { BackofficeShipmentDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeFailShipment(
  id: string,
  note: string,
): Promise<BackofficeShipmentDetail> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/shipments/${id}/fail`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  return handleApiResponse(response);
}
