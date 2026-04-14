import { useEffect, useState, useCallback } from 'react';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeOrders } from '@/features/orders/hooks/useBackofficeOrders';
import { BackofficeOrdersFilters, BackofficeOrdersTable } from '@/features/orders';
import { BackofficePagination } from '@/shared/components/BackofficePagination';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { OrderStatus } from '@/shared/types/enums';

const LIMIT = 20;

export default function OrdenesPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { orders, pagination, isLoading, error, fetchOrders } = useBackofficeOrders();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback((p: number, s: typeof statusFilter, c: string) => {
    void fetchOrders({
      page: p,
      limit: LIMIT,
      ...(s && { status: s }),
      ...(c && { customerName: c }),
    });
  }, [fetchOrders]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) load(page, statusFilter, customerSearch); }, [isAuthenticated]);

  const handleSearch = () => {
    setCustomerSearch(searchInput);
    setPage(1);
    load(1, statusFilter, searchInput);
  };

  const handleStatusChange = (s: OrderStatus | '') => {
    setStatusFilter(s);
    setPage(1);
    load(1, s, customerSearch);
  };

  const handlePage = (p: number) => {
    setPage(p);
    load(p, statusFilter, customerSearch);
  };

  const totalPages = pagination ? pagination.totalPages : 1;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Órdenes"
        breadcrumbs={[{ label: 'Órdenes' }]}
      >
        <BackofficeOrdersFilters
          statusFilter={statusFilter}
          searchInput={searchInput}
          onSearchInput={setSearchInput}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
        />

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold mb-6 max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <BackofficeOrdersTable isLoading={isLoading} orders={orders} />

        {!isLoading && (
          <BackofficePagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePage}
          />
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}

