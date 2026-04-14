import { AccountLayout } from '@/shared/layouts/AccountLayout';
import { ProtectedRoute, useAuth } from '@/features/auth';
import { useMyOrders } from '@/features/orders';
import { useMyFavorites } from '@/features/products';
import { AccountStats, AccountLastOrder } from '@/features/users';

export default function MiCuentaPage() {
  const { user } = useAuth();
  const { orders, isLoading: ordersLoading } = useMyOrders(5);
  const { total: favoritesTotal, isLoading: favsLoading } = useMyFavorites(1);

  const lastOrder = orders[0] ?? null;

  return (
    <ProtectedRoute>
      <AccountLayout title="Mi Cuenta">
        <AccountStats
          phoneVerified={user?.phoneVerified}
          favoritesTotal={favoritesTotal}
          favsLoading={favsLoading}
          customerRole={user?.customerRole ?? undefined}
        />

        <AccountLastOrder order={lastOrder} isLoading={ordersLoading} />
      </AccountLayout>
    </ProtectedRoute>
  );
}
