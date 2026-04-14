import { useState, useEffect, useRef, useCallback } from 'react';
import { useProductsPage } from '../../hooks/useProductsPage';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import { ProductCard } from '../ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductFilterDrawer } from './ProductFilterDrawer';
import { SortSelect } from './SortSelect';
import type { ProductCardData } from '../../application/mapProductsToCardData';
import type { CategoryTreeNode } from '../../domain/types';

interface ProductsPageProps {
  initialProducts: ProductCardData[];
  initialTotal: number;
  categoryTree: CategoryTreeNode[];
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-[var(--shadow-surface-card)] animate-pulse">
      <div className="aspect-[4/5] bg-surface-overlay" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-surface-overlay rounded-full w-16" />
        <div className="h-3 bg-surface-overlay rounded-full w-full" />
        <div className="h-3 bg-surface-overlay rounded-full w-2/3" />
        <div className="h-4 bg-surface-overlay rounded-full w-20 mt-1" />
      </div>
      <div className="px-3 pb-3">
        <div className="h-8 bg-surface-overlay rounded-full" />
      </div>
    </div>
  );
}

/* ── FAB button ── */
function FilterFab({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-extrabold text-sm shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-[0_0.5rem_1.5rem_rgba(0,197,212,0.4)]"
      style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
      aria-label={`Abrir filtros${count > 0 ? ` (${count} activos)` : ''}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
          clipRule="evenodd"
        />
      </svg>
      Filtros

      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-pink text-white text-[0.625rem] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Empty state ── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="text-5xl mb-4" role="img" aria-label="Lupa">
        🔍
      </span>
      <h3 className="text-lg font-extrabold text-on-surface mb-2">No encontramos productos</h3>
      <p className="text-sm text-on-surface-muted mb-6 max-w-[20rem]">
        Intenta con otros filtros o limpia la búsqueda para ver todos los productos.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="px-6 py-2.5 rounded-xl text-sm font-extrabold text-white cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.4)]"
        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
      >
        Limpiar filtros
      </button>
    </div>
  );
}

/* ── Loading spinner ── */
function LoadingSpinner() {
  return (
    <div className="flex justify-center py-8">
      <svg className="w-7 h-7 animate-spin text-turquoise" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} className="opacity-20" />
        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="opacity-75" />
      </svg>
    </div>
  );
}

/* ── Main component ── */
export function ProductsPage({ initialProducts, initialTotal, categoryTree }: ProductsPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useProductsPage({ initialProducts, initialTotal, categoryTree });

  const { addToCart, addingId, successId } = useAddToCart();

  // ── Infinite scroll (IntersectionObserver) ──
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current) {
          loadMoreRef.current();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleSortChange = useCallback(
    (value: string) => setFilter('sortValue', value),
    [setFilter],
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-6 lg:py-8">
      {/* ── Page header ── */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-on-surface">Todos los productos</h1>
        <div
          className="h-1 w-16 rounded-full mt-2"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A)' }}
          aria-hidden="true"
        />
      </div>

      {/* ── Layout: sidebar + grid ── */}
      <div className="flex gap-8">
        {/* ── Sidebar (desktop) ── */}
        <aside
          aria-label="Filtros de productos"
          className="hidden lg:block w-[17.5rem] shrink-0 self-start sticky top-24"
        >
          <div className="bg-surface rounded-2xl border border-stroke overflow-hidden shadow-[var(--shadow-surface-card)]">
            <ProductFilters
              filters={filters}
              onFilterChange={setFilter}
              onClear={clearFilters}
              categoryTree={categoryTree}
              activeFilterCount={activeFilterCount}
              variant="light"
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* ── Toolbar: count + sort ── */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <p className="text-sm text-on-surface-muted font-semibold" aria-live="polite">
              {isLoading ? (
                <span className="inline-block w-32 h-4 bg-surface-overlay rounded-full animate-pulse" />
              ) : (
                <>
                  <span className="text-on-surface font-extrabold">{total.toLocaleString('es-MX')}</span>{' '}
                  producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                </>
              )}
            </p>
            <SortSelect value={filters.sortValue} onChange={handleSortChange} />
          </div>

          {/* ── Product grid ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} aria-hidden="true" className="h-1" />

              {isLoadingMore && <LoadingSpinner />}

              {!hasMore && products.length > 0 && (
                <p className="text-center text-sm text-on-surface-muted font-semibold py-8">
                  Has visto todos los productos
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      <FilterFab count={activeFilterCount} onClick={() => setDrawerOpen(true)} />

      {/* ── Mobile drawer ── */}
      <ProductFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        categoryTree={categoryTree}
        activeFilterCount={activeFilterCount}
        total={total}
      />
    </div>
  );
}
