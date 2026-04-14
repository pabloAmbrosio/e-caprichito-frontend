import type { InventoryWithProduct } from '../../domain/types';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function getInventoryByProductId(
  productId: string,
): Promise<InventoryWithProduct> {
  const response = await authFetch(
    `${BASE_URL}/api/backoffice/inventory/${productId}`,
  );
  return handleApiResponse(response);
}
