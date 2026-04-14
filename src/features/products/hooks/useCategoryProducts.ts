import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createProductApi } from '../infrastructure/productApi';
import { mapProductsToCardData, type ProductCardData } from '../application/mapProductsToCardData';

const productApi = createProductApi();
const LIMIT = 20;

interface UseCategoryProductsParams {
  initialProducts: ProductCardData[];
  initialTotal: number;
  allCategoryIds: string[];
  initialSubcategoryId?: string | null;
}

interface UseCategoryProductsReturn {
  products: ProductCardData[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  activeSubcategoryId: string | null;
  setActiveSubcategoryId: (id: string | null) => void;
}

export function useCategoryProducts({
  initialProducts,
  initialTotal,
  allCategoryIds,
  initialSubcategoryId,
}: UseCategoryProductsParams): UseCategoryProductsReturn {
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(initialProducts.length);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(initialSubcategoryId ?? null);

  const isFirstRender = useRef(true);

  const activeIds = useMemo(() => {
    if (activeSubcategoryId === null) return allCategoryIds;
    return [activeSubcategoryId];
  }, [activeSubcategoryId, allCategoryIds]);

  const fetchProducts = useCallback(
    async (fetchOffset: number, replace: boolean) => {
      if (replace) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const { items, total: newTotal } = await productApi.list({
          categoryIds: activeIds,
          limit: LIMIT,
          offset: fetchOffset,
          sort: [{ field: 'createdAt', direction: 'desc' }],
        });

        const mapped = mapProductsToCardData(items);

        if (replace) {
          setProducts(mapped);
          setOffset(mapped.length);
        } else {
          setProducts((prev) => [...prev, ...mapped]);
          setOffset(fetchOffset + mapped.length);
        }
        setTotal(newTotal);
      } catch {
        // Silent fail — products stay as they are
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeIds],
  );

  // Refetch when subcategory filter changes (skip first render — SSR data already present)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    void fetchProducts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIds]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || isLoading) return;
    void fetchProducts(offset, false);
  }, [offset, isLoadingMore, isLoading, fetchProducts]);

  const hasMore = products.length < total;

  return {
    products,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    activeSubcategoryId,
    setActiveSubcategoryId,
  };
}
