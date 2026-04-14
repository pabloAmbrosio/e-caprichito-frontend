import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { createCartApi } from '@/features/cart/infrastructure/cartApi';
import type { BackofficeCart } from '@/features/cart/domain/types';
import {
  CartDetailHeader,
  CartItemsList,
  CartDangerZone,
} from '@/features/cart/components/BackofficeCart';

const api = createCartApi();

export default function CarritoDetallePage() {
  const router = useRouter();
  const { id } = router.query;

  const [cart, setCart] = useState<BackofficeCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchCart = useCallback(async (cartId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.backofficeGetById(cartId);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    void fetchCart(id);
  }, [id, fetchCart]);

  const handleDelete = async () => {
    if (!cart) return;
    setIsDeleting(true);
    try {
      await api.backofficeDelete(cart.id);
      void router.replace('/backoffice/carts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el carrito');
      setIsDeleting(false);
    }
  };

  const total = cart?.items.reduce((s, i) => s + i.product.priceInCents * i.quantity, 0) ?? 0;
  const totalQty = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Detalle del Carrito"
        breadcrumbs={[
          { label: 'Carritos', href: '/backoffice/carts' },
          { label: cart?.id.slice(0, 8) ?? '…' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-2xl flex flex-col gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error && !cart ? (
          <div
            className="p-4 rounded-xl border text-sm font-semibold max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
          >
            {error}
          </div>
        ) : cart ? (
          <div className="max-w-2xl flex flex-col gap-5">

            <CartDetailHeader cart={cart} total={total} totalQty={totalQty} />

            <CartItemsList items={cart.items} total={total} />

            <CartDangerZone
              error={error}
              isDeleting={isDeleting}
              deleteConfirm={deleteConfirm}
              onShowConfirm={() => { setDeleteConfirm(true); }}
              onHideConfirm={() => { setDeleteConfirm(false); }}
              onDelete={() => { void handleDelete(); }}
            />

            <div className="pb-8">
              <Link
                href="/backoffice/carts"
                className="text-sm font-bold transition-colors hover:text-turquoise"
                style={{ color: 'var(--on-surface-muted)' }}
              >
                ← Volver a carritos
              </Link>
            </div>
          </div>
        ) : null}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
