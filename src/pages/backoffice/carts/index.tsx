import { useEffect, useState, useCallback } from 'react';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeCartList } from '@/features/cart/hooks/useBackofficeCartList';
import {
  CarritosTabBar,
  CarritosSearchBar,
  InactiveDaysFilter,
  CartTableSkeleton,
  CartEmptyState,
  CartsPagination,
  ActiveCartsTable,
  AbandonedCartsTable,
} from '@/features/cart/components/BackofficeCart';
import type { CartTab } from '@/features/cart/components/BackofficeCart';

const LIMIT = 20;

export default function CarritosPage() {
  const {
    carts, pagination, isLoading, error,
    abandoned, abandonedPagination, isLoadingAbandoned, abandonedError,
    isDeleting, fetchCarts, fetchAbandoned, deleteCart,
  } = useBackofficeCartList();

  const [tab, setTab] = useState<CartTab>('activos');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [inactiveDays, setInactiveDays] = useState(7);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadActive = useCallback((p: number, s: string) => {
    void fetchCarts({ page: p, limit: LIMIT, ...(s && { search: s }) });
  }, [fetchCarts]);

  const loadAbandoned = useCallback((p: number, days: number) => {
    void fetchAbandoned({ page: p, limit: LIMIT, inactiveDays: days });
  }, [fetchAbandoned]);

  useEffect(() => { loadActive(1, ''); }, []);
  useEffect(() => { loadAbandoned(1, 7); }, []);

  const handleSearch = () => {
    setSearchVal(searchInput);
    setPage(1);
    loadActive(1, searchInput);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCart(id);
      setDeleteId(null);
    } catch {
      // error handled in hook
    }
  };

  const activeTotalPages = (pagination as { totalPages?: number } | null)?.totalPages ?? 1;
  const abandonedTotalPages = (abandonedPagination as { totalPages?: number } | null)?.totalPages ?? 1;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout title="Carritos" breadcrumbs={[{ label: 'Carritos' }]}>

        <CarritosTabBar
          tab={tab}
          onChange={(t) => { setTab(t); setPage(1); }}
        />

        {/* ── TAB ACTIVOS ── */}
        {tab === 'activos' && (
          <>
            <CarritosSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
            />

            {error && (
              <div
                className="p-4 rounded-xl border text-sm font-semibold mb-6"
                style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
              >
                {error}
              </div>
            )}

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              {isLoading ? (
                <CartTableSkeleton />
              ) : carts.length === 0 ? (
                <CartEmptyState />
              ) : (
                <ActiveCartsTable
                  carts={carts}
                  deleteId={deleteId}
                  isDeleting={isDeleting}
                  onDeleteStart={setDeleteId}
                  onDeleteCancel={() => { setDeleteId(null); }}
                  onDeleteConfirm={(id) => { void handleDelete(id); }}
                />
              )}
            </div>

            {!isLoading && carts.length === LIMIT && (
              <CartsPagination
                page={page}
                totalPages={activeTotalPages}
                onPrev={() => { const p = Math.max(1, page - 1); setPage(p); loadActive(p, searchVal); }}
                onNext={() => { const p = page + 1; setPage(p); loadActive(p, searchVal); }}
              />
            )}
          </>
        )}

        {/* ── TAB ABANDONADOS ── */}
        {tab === 'abandonados' && (
          <>
            <InactiveDaysFilter
              value={inactiveDays}
              onChange={(days) => { setInactiveDays(days); setPage(1); loadAbandoned(1, days); }}
            />

            {abandonedError && (
              <div
                className="p-4 rounded-xl border text-sm font-semibold mb-6"
                style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
              >
                {abandonedError}
              </div>
            )}

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              {isLoadingAbandoned ? (
                <CartTableSkeleton />
              ) : abandoned.length === 0 ? (
                <CartEmptyState message={`No hay carritos abandonados con ${inactiveDays}+ días de inactividad`} />
              ) : (
                <AbandonedCartsTable
                  carts={abandoned}
                  inactiveDays={inactiveDays}
                  deleteId={deleteId}
                  isDeleting={isDeleting}
                  onDeleteStart={setDeleteId}
                  onDeleteCancel={() => { setDeleteId(null); }}
                  onDeleteConfirm={(id) => { void handleDelete(id); }}
                />
              )}
            </div>

            {!isLoadingAbandoned && abandoned.length === LIMIT && (
              <CartsPagination
                page={page}
                totalPages={abandonedTotalPages}
                onPrev={() => { const p = Math.max(1, page - 1); setPage(p); loadAbandoned(p, inactiveDays); }}
                onNext={() => { const p = page + 1; setPage(p); loadAbandoned(p, inactiveDays); }}
              />
            )}
          </>
        )}

      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
