import type { BannersResponse, ProductBanner } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getBanners(): Promise<ProductBanner[]> {
  const response = await fetch(`${BASE_URL}/api/promotions/banners`, {
    credentials: 'include',
  });
  const data = await handleApiResponse<BannersResponse>(response);
  return data.product;
}
