import type { InventoryItem } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function createInventory(
  productId: string,
  physicalStock: number,
): Promise<InventoryItem> {
  const response = await authFetch(`${BASE_URL}/api/backoffice/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, physicalStock }),
  });
  return handleApiResponse(response);
}
