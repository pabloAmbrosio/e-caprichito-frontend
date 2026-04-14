import type { BackofficeShipmentListItem } from '../../domain/types';
import type { PaginatedResponse, Pagination } from '@/shared/types/api';
import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { FeatureApiError } from '@/shared/utils/apiError';

// Backend returns { success, msg, items, pagination } at root level
// (not wrapped in `data`), so we parse manually instead of handleApiResponse.
interface RawResponse {
  success: boolean;
  msg?: string;
  items: BackofficeShipmentListItem[];
  pagination: Pagination;
  error?: string;
  code?: string;
}

export async function backofficeListShipments(
  params?: {
    page?: number;
    limit?: number;
    status?: ShipmentStatus;
    type?: DeliveryType;
  },
): Promise<PaginatedResponse<BackofficeShipmentListItem>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.type) query.set('type', params.type);
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/backoffice/shipments${qs ? `?${qs}` : ''}`);

  if (response.status >= 500) {
    throw new FeatureApiError(`Server error ${response.status}`, response.status);
  }

  const data = (await response.json()) as RawResponse;

  if (!response.ok) {
    throw new FeatureApiError(
      data.code ?? data.error ?? `Error ${response.status}`,
      response.status,
      data.code,
    );
  }

  return { items: data.items, pagination: data.pagination };
}
