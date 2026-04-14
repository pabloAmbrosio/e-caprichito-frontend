import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { ProductForm } from '@/features/products/components/BackofficeProduct/ProductForm';

export default function NuevoProductoPage() {
  const router = useRouter();

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Nuevo Producto"
        breadcrumbs={[
          { label: 'Productos', href: '/backoffice/products' },
          { label: 'Nuevo' },
        ]}
      >
        <ProductForm
          mode="create"
          onSuccess={(id) => void router.push(`/backoffice/products/${id}`)}
          onCancel={() => void router.push('/backoffice/products')}
        />
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
