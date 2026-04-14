import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { ProtectedRoute } from '@/features/auth/guards/ProtectedRoute';
import { CheckoutPage } from '@/features/orders/components/Checkout';

export default function CheckoutRoute() {
  return (
    <ProtectedRoute>
      <TiendaLayout showTopbar={false} showFooter={false}>
        <CheckoutPage />
      </TiendaLayout>
    </ProtectedRoute>
  );
}
