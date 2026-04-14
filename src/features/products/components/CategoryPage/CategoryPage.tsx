import { useRef, useEffect } from 'react';
import Head from 'next/head';
import { ProductCard } from '../ProductCard';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { CategoryPageHeader } from './CategoryPageHeader';
import { SubcategoryChips } from './SubcategoryChips';
import type { CategoryPageInfo, SubcategoryChip, ParentCategoryInfo } from '../../application/getCategoryPageData';
import type { ProductCardData } from '../../application/mapProductsToCardData';

interface CategoryPageProps {
  category: CategoryPageInfo;
  subcategories: SubcategoryChip[];
  initialProducts: ProductCardData[];
  initialTotal: number;
  categoryIds: string[];
  initialSubcategoryId: string | null;
  parentCategory: ParentCategoryInfo | null;
}

export function CategoryPage({
  category,
  subcategories,
  initialProducts,
  initialTotal,
  categoryIds,
  initialSubcategoryId,
  parentCategory,
}: CategoryPageProps) {
  const {
    products,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    activeSubcategoryId,
    setActiveSubcategoryId,
  } = useCategoryProducts({ initialProducts, initialTotal, allCategoryIds: categoryIds, initialSubcategoryId });

  const { addToCart, addingId, successId } = useAddToCart();

  // Infinite scroll via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <>
      <Head>
        <title>{`${category.name} — La Central Caribeña`}</title>
        <meta
          name="description"
          content={category.description ?? `Productos de ${category.name} en La Central Caribeña`}
        />
      </Head>

      <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-6 lg:py-8">
        <CategoryPageHeader category={category} total={total} parentCategory={parentCategory} />

        {subcategories.length > 0 && (
          <SubcategoryChips
            subcategories={subcategories}
            activeId={activeSubcategoryId}
            onSelect={setActiveSubcategoryId}
          />
        )}

        {/* Product grid (stays visible while loading — no flicker) */}
        {products.length > 0 && (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-24">
                <div
                  className="w-8 h-8 rounded-full border-[3px] border-turquoise/20 border-t-turquoise animate-spin"
                  role="status"
                  aria-label="Cargando productos"
                />
              </div>
            )}
            <div
              className={[
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-200',
                isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100',
              ].join(' ')}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  isAdding={addingId === product.id}
                  isSuccess={successId === product.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons — only when no products at all (first load) */}
        {isLoading && products.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array<undefined>(8)].map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-stroke rounded-2xl overflow-hidden animate-pulse"
                aria-hidden="true"
              >
                <div className="aspect-square bg-surface-overlay" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="w-16 h-3 rounded-full bg-surface-overlay" />
                  <div className="w-full h-4 rounded-full bg-surface-overlay" />
                  <div className="w-20 h-4 rounded-full bg-surface-overlay" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4" aria-hidden="true">📦</span>
            <h2 className="text-lg font-extrabold text-on-surface mb-1">
              No hay productos
            </h2>
            <p className="text-sm text-on-surface-muted">
              No encontramos productos en esta categoria por ahora.
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />

        {/* Loading more spinner */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div
              className="w-8 h-8 rounded-full border-[3px] border-turquoise/20 border-t-turquoise animate-spin"
              role="status"
              aria-label="Cargando mas productos"
            />
          </div>
        )}
      </section>
    </>
  );
}
