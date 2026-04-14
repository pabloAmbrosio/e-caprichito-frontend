import type { InventoryWithProduct } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function releaseInventory(
  productId: string,
  quantity: number,
): Promise<InventoryWithProduct> {
  const response = await authFetch(
    `${BASE_URL}/api/backoffice/inventory/release`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    },
  );
  return handleApiResponse(response);
}
