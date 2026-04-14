import { AccountLayout } from '@/shared/layouts/AccountLayout';
import { ProtectedRoute } from '@/features/auth';
import {
  useMyOrders,
  OrderItemCard as OrderItem,
  OrdersPagination,
  OrdersEmptyState,
} from '@/features/orders';

export default function MisPedidosPage() {
  const { orders, pagination, isLoading, error, page, setPage } = useMyOrders(10);

  return (
    <ProtectedRoute>
      <AccountLayout title="Mis Pedidos">
        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array<undefined>(4)].map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-stroke rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
                aria-hidden="true"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-3 rounded-full bg-surface-overlay" />
                  <div className="w-20 h-5 rounded-full bg-surface-overlay" />
                </div>
                <div className="w-48 h-3 rounded-full bg-surface-overlay" />
                <div className="w-28 h-3 rounded-full bg-surface-overlay" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 text-pink text-sm font-semibold">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && <OrdersEmptyState />}

        {!isLoading && orders.length > 0 && (
          <>
            {/* Order count */}
            {pagination && (
              <p className="text-sm text-on-surface-muted mb-4">
                {pagination.total} pedido{pagination.total !== 1 ? 's' : ''} en total
              </p>
            )}

            <div className="flex flex-col gap-3" role="list" aria-label="Lista de pedidos">
              {orders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <OrdersPagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </AccountLayout>
    </ProtectedRoute>
  );
}
