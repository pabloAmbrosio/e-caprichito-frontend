import type { ProductDetail } from '../../domain/types';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function getBySlugOrId(idOrSlug: string): Promise<ProductDetail> {
  // Plain fetch — endpoint is public (optional auth).
  // isLikedByUser will be false in SSG context; the client-side likedStore
  // overrides this after hydration via useLikeToggle.
  const response = await fetch(
    `${BASE_URL}/api/products/${encodeURIComponent(idOrSlug)}`,
    { credentials: 'include' }
  );
  return handleApiResponse(response);
}
