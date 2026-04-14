import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { createProductApi } from '../infrastructure/productApi';
import { mapProductsToCardData, type ProductCardData } from '../application/mapProductsToCardData';
import type { CategoryTreeNode, ProductSearchFilters, SortOption } from '../domain/types';

const productApi = createProductApi();
const LIMIT = 20;

/* ── Sort options ── */

export interface SortOptionUI {
  label: string;
  value: string;
  sort: SortOption[];
  includeSales?: boolean;
  includeLikes?: boolean;
}

export const SORT_OPTIONS: SortOptionUI[] = [
  { label: 'Más recientes', value: 'createdAt:desc', sort: [{ field: 'createdAt', direction: 'desc' }] },
  { label: 'Precio: menor a mayor', value: 'price:asc', sort: [{ field: 'price', direction: 'asc' }] },
  { label: 'Precio: mayor a menor', value: 'price:desc', sort: [{ field: 'price', direction: 'desc' }] },
  { label: 'Más populares', value: 'sales:desc', sort: [{ field: 'sales', direction: 'desc' }], includeSales: true },
  { label: 'Más queridos', value: 'likes:desc', sort: [{ field: 'likes', direction: 'desc' }], includeLikes: true },
];

/* ── Filter state ── */

export interface FiltersState {
  query: string;
  categoryIds: string[];
  minPrice: string;
  maxPrice: string;
  tags: string[];
  sortValue: string;
}

const INITIAL_FILTERS: FiltersState = {
  query: '',
  categoryIds: [],
  minPrice: '',
  maxPrice: '',
  tags: [],
  sortValue: 'createdAt:desc',
};

/* ── Helpers: URL ↔ Filters ── */

function resolveSlugToId(slug: string, tree: CategoryTreeNode[]): string | null {
  for (const node of tree) {
    if (node.slug === slug) return node.id;
    for (const child of node.children) {
      if (child.slug === slug) return child.id;
    }
  }
  return null;
}

function resolveIdToSlug(id: string, tree: CategoryTreeNode[]): string | null {
  for (const node of tree) {
    if (node.id === id) return node.slug;
    for (const child of node.children) {
      if (child.id === id) return child.slug;
    }
  }
  return null;
}

function filtersFromQuery(
  query: Record<string, string | string[] | undefined>,
  tree: CategoryTreeNode[],
): FiltersState {
  const q = (typeof query.q === 'string' ? query.q : '') || '';
  const categorySlugs = typeof query.categories === 'string' ? query.categories.split(',').filter(Boolean) : [];
  const categoryIds = categorySlugs.map((s) => resolveSlugToId(s, tree)).filter((id): id is string => id !== null);
  const minPrice = typeof query.minPrice === 'string' ? query.minPrice : '';
  const maxPrice = typeof query.maxPrice === 'string' ? query.maxPrice : '';
  const tags = typeof query.tags === 'string' ? query.tags.split(',').filter(Boolean) : [];
  const sortValue = typeof query.sort === 'string' && SORT_OPTIONS.some((o) => o.value === query.sort) ? query.sort : 'createdAt:desc';

  return { query: q, categoryIds, minPrice, maxPrice, tags, sortValue };
}

function filtersToQueryParams(filters: FiltersState, tree: CategoryTreeNode[]): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.query) params.q = filters.query;
  if (filters.categoryIds.length) {
    const slugs = filters.categoryIds.map((id) => resolveIdToSlug(id, tree)).filter((s): s is string => s !== null);
    if (slugs.length) params.categories = slugs.join(',');
  }
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.tags.length) params.tags = filters.tags.join(',');
  if (filters.sortValue !== 'createdAt:desc') params.sort = filters.sortValue;
  return params;
}

/* ── Build API filters ── */

function buildApiFilters(filters: FiltersState): {
  base: ProductSearchFilters;
  featured: ProductSearchFilters;
} {
  const sortOption = SORT_OPTIONS.find((o) => o.value === filters.sortValue) ?? SORT_OPTIONS[0]!;

  const common: ProductSearchFilters = {
    limit: LIMIT,
    sort: sortOption.sort,
  };

  if (filters.categoryIds.length) common.categoryIds = filters.categoryIds;
  if (filters.query) common.title = filters.query;
  if (filters.tags.length) common.tags = filters.tags;
  if (filters.minPrice) {
    const cents = Math.round(Number(filters.minPrice) * 100);
    if (!Number.isNaN(cents) && cents > 0) common.minPriceInCents = cents;
  }
  if (filters.maxPrice) {
    const cents = Math.round(Number(filters.maxPrice) * 100);
    if (!Number.isNaN(cents) && cents > 0) common.maxPriceInCents = cents;
  }
  if (sortOption.includeSales) common.includeSales = true;
  if (sortOption.includeLikes) common.includeLikes = true;

  return {
    base: { ...common },
    featured: { ...common, isFeatured: true },
  };
}

/* ── Hook ── */

interface UseProductsPageParams {
  initialProducts: ProductCardData[];
  initialTotal: number;
  categoryTree: CategoryTreeNode[];
}

interface UseProductsPageReturn {
  products: ProductCardData[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  filters: FiltersState;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

export function useProductsPage({
  initialProducts,
  initialTotal,
  categoryTree,
}: UseProductsPageParams): UseProductsPageReturn {
  const router = useRouter();
  const isFirstRender = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Filters state (initialized from URL) ──
  const [filters, setFilters] = useState<FiltersState>(() => {
    if (typeof window === 'undefined') return INITIAL_FILTERS;
    return filtersFromQuery(router.query, categoryTree);
  });

  // ── Product state ──
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardData[]>([]);
  const [regularProducts, setRegularProducts] = useState<ProductCardData[]>(initialProducts);
  const [featuredTotal, setFeaturedTotal] = useState(0);
  const [regularTotal, setRegularTotal] = useState(initialTotal);
  const [featuredOffset, setFeaturedOffset] = useState(0);
  const [regularOffset, setRegularOffset] = useState(initialProducts.length);
  const [featuredDone, setFeaturedDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ── Deduplicated merged list ──
  const products = useMemo(() => {
    const featuredIds = new Set(featuredProducts.map((p) => p.id));
    const deduped = regularProducts.filter((p) => !featuredIds.has(p.id));
    return [...featuredProducts, ...deduped];
  }, [featuredProducts, regularProducts]);

  // Total = regular total (which includes featured in its count, they are just reordered)
  const total = regularTotal;
  const hasMore = products.length < total;

  // ── Active filter count (for badge) ──
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categoryIds.length) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.tags.length) count++;
    return count;
  }, [filters]);

  // ── Fetch products ──
  const fetchProducts = useCallback(
    async (currentFilters: FiltersState, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { base, featured } = buildApiFilters(currentFilters);

        if (append) {
          // Load more: continue paginating
          if (!featuredDone) {
            // Still loading featured
            const { items, total: ft } = await productApi.list({ ...featured, offset: featuredOffset });
            const mapped = mapProductsToCardData(items);
            if (mapped.length < LIMIT) {
              setFeaturedDone(true);
              // Also fetch regular to fill
              const { items: rItems, total: rt } = await productApi.list({ ...base, offset: regularOffset });
              const rMapped = mapProductsToCardData(rItems);
              setRegularProducts((prev) => [...prev, ...rMapped]);
              setRegularTotal(rt);
              setRegularOffset((prev) => prev + rMapped.length);
            }
            setFeaturedProducts((prev) => [...prev, ...mapped]);
            setFeaturedTotal(ft);
            setFeaturedOffset((prev) => prev + mapped.length);
          } else {
            // Only regular
            const { items, total: rt } = await productApi.list({ ...base, offset: regularOffset });
            const mapped = mapProductsToCardData(items);
            setRegularProducts((prev) => [...prev, ...mapped]);
            setRegularTotal(rt);
            setRegularOffset((prev) => prev + mapped.length);
          }
        } else {
          // Fresh fetch (filter change)
          const [featuredRes, regularRes] = await Promise.all([
            productApi.list({ ...featured, offset: 0 }),
            productApi.list({ ...base, offset: 0 }),
          ]);

          const fMapped = mapProductsToCardData(featuredRes.items);
          const rMapped = mapProductsToCardData(regularRes.items);

          setFeaturedProducts(fMapped);
          setFeaturedTotal(featuredRes.total);
          setFeaturedOffset(fMapped.length);
          setFeaturedDone(fMapped.length < LIMIT);

          setRegularProducts(rMapped);
          setRegularTotal(regularRes.total);
          setRegularOffset(rMapped.length);
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [featuredDone, featuredOffset, regularOffset],
  );

  // ── Sync URL → state on query change (browser back/forward) ──
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // If URL has filters on mount, fetch with them
      const hasUrlFilters = Object.keys(router.query).some((k) =>
        ['q', 'categories', 'minPrice', 'maxPrice', 'tags', 'sort'].includes(k),
      );
      if (hasUrlFilters) {
        const parsed = filtersFromQuery(router.query, categoryTree);
        setFilters(parsed);
        void fetchProducts(parsed, false);
      }
      return;
    }

    const parsed = filtersFromQuery(router.query, categoryTree);
    setFilters(parsed);
    void fetchProducts(parsed, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  // ── Set single filter + sync URL ──
  const setFilter = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };

        // Debounce text inputs
        if (key === 'query' || key === 'minPrice' || key === 'maxPrice') {
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            const params = filtersToQueryParams(next, categoryTree);
            void router.replace({ pathname: '/products', query: params }, undefined, { shallow: true });
          }, 300);
        } else {
          const params = filtersToQueryParams(next, categoryTree);
          void router.replace({ pathname: '/products', query: params }, undefined, { shallow: true });
        }

        return next;
      });
    },
    [categoryTree, router],
  );

  // ── Clear all ──
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    void router.replace('/products', undefined, { shallow: true });
  }, [router]);

  // ── Load more ──
  const loadMore = useCallback(() => {
    if (isLoadingMore || isLoading) return;
    void fetchProducts(filters, true);
  }, [isLoadingMore, isLoading, fetchProducts, filters]);

  return {
    products,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
  };
}
