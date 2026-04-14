import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { CategoryForm } from '@/features/products/components/BackofficeCategory/CategoryForm';

export default function NuevaCategoriaPage() {
  const router = useRouter();

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Nueva Categoría"
        breadcrumbs={[
          { label: 'Categorías', href: '/backoffice/categories' },
          { label: 'Nueva' },
        ]}
      >
        <CategoryForm
          mode="create"
          onSuccess={() => void router.push('/backoffice/categories')}
          onCancel={() => void router.push('/backoffice/categories')}
        />
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
