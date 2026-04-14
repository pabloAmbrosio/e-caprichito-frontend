import type { BackofficeOrderListItem } from '../../domain/types';
import type { PaginatedResponse } from '@/shared/types/api';
import type { OrderStatus } from '@/shared/types/enums';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function backofficeListOrders(
  params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    customerName?: string;
    productName?: string;
  },
): Promise<PaginatedResponse<BackofficeOrderListItem>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status as string);
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  if (params?.customerName) query.set('customerName', params.customerName);
  if (params?.productName) query.set('productName', params.productName);
  const qs = query.toString();
  const response = await authFetch(`${BASE_URL}/api/backoffice/order${qs ? `?${qs}` : ''}`);
  return handleApiResponse(response);
}
