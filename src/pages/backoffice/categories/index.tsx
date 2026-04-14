import { useEffect } from 'react';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeCategories } from '@/features/products/hooks/useBackofficeCategories';
import { BackofficeCategoriesTable } from '@/features/products';
import { useAuthStore } from '@/features/auth/store/authStore';

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function BackofficeCategoriasPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { categories, isLoading, error, fetchCategories, deleteCategory } = useBackofficeCategories();

  useEffect(() => {
    if (isAuthenticated) void fetchCategories();
  }, [isAuthenticated, fetchCategories]);

  const roots = categories.filter((c) => !c.parentId);
  const subs = categories.filter((c) => !!c.parentId);

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Categorías"
        breadcrumbs={[{ label: 'Categorías' }]}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
            {isLoading ? 'Cargando...' : `${categories.length} categorías en total — ${roots.length} raíz, ${subs.length} subcategorías`}
          </p>
          <Link
            href="/backoffice/categories/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,197,212,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            <PlusIcon />
            Nueva categoría
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <BackofficeCategoriesTable
          isLoading={isLoading}
          categories={categories}
          onDelete={deleteCategory}
        />
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
