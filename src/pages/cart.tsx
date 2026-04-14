import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { CartPage } from '@/features/cart/components/CartPage';

export default function CarritoPage() {
  return (
    <TiendaLayout showTopbar={false}>
      <CartPage />
    </TiendaLayout>
  );
}
