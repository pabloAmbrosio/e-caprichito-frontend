import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { ProductForm } from '@/features/products/components/BackofficeProduct/ProductForm';
import { useBackofficeProductDetail } from '@/features/products/hooks/useBackofficeProductDetail';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function EditarProductoPage() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { product, isLoading, error, fetchProduct } = useBackofficeProductDetail();

  useEffect(() => {
    if (!isAuthenticated || !id || typeof id !== 'string') return;
    void fetchProduct(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title={product?.title ?? 'Editar Producto'}
        breadcrumbs={[
          { label: 'Productos', href: '/backoffice/products' },
          { label: product?.title ?? '...' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-3xl flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        ) : product ? (
          <ProductForm
            mode="edit"
            initialData={product}
            onSuccess={() => void router.push('/backoffice/products')}
            onCancel={() => void router.push('/backoffice/products')}
          />
        ) : null}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
