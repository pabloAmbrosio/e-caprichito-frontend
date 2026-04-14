import { useRouter } from 'next/router';
import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { ProtectedRoute } from '@/features/auth/guards/ProtectedRoute';
import { PaymentPage } from '@/features/orders/components/PaymentPage';

export default function PaymentRoute() {
  const router = useRouter();
  const orderId = router.query.orderId as string | undefined;

  if (!orderId) return null;

  return (
    <ProtectedRoute>
      <TiendaLayout showTopbar={false} showFooter={false}>
        <PaymentPage orderId={orderId} />
      </TiendaLayout>
    </ProtectedRoute>
  );
}
