import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { CategoryForm } from '@/features/products/components/BackofficeCategory/CategoryForm';
import { useBackofficeCategories } from '@/features/products/hooks/useBackofficeCategories';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Category } from '@/features/products';

export default function EditarCategoriaPage() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { getCategoryById } = useBackofficeCategories();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !id || typeof id !== 'string') return;
    setIsLoading(true);
    getCategoryById(id)
      .then((cat) => { setCategory(cat); setIsLoading(false); })
      .catch(() => { setError('No se encontró la categoría.'); setIsLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title={category?.name ?? 'Editar Categoría'}
        breadcrumbs={[
          { label: 'Categorías', href: '/backoffice/categories' },
          { label: category?.name ?? '...' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-2xl flex flex-col gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        ) : category ? (
          <CategoryForm
            mode="edit"
            initialData={category}
            onSuccess={() => void router.push('/backoffice/categories')}
            onCancel={() => void router.push('/backoffice/categories')}
          />
        ) : null}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
