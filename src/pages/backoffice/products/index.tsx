import { useEffect, useState, useCallback } from 'react';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeProducts } from '@/features/products/hooks/useBackofficeProducts';
import { useBackofficeCategories } from '@/features/products/hooks/useBackofficeCategories';
import { BackofficeProductsFilters, BackofficeProductsTable } from '@/features/products';
import { BackofficePagination } from '@/shared/components/BackofficePagination';
import { useAuthStore } from '@/features/auth/store/authStore';

const LIMIT = 20;

export default function BackofficeProductosPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { products, total, isLoading, error, fetchProducts } = useBackofficeProducts();
  const { categories, fetchCategories } = useBackofficeCategories();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(total / LIMIT);

  const loadProducts = useCallback(() => {
    void fetchProducts({
      title: search || undefined,
      categoryIds: filterCategory ? [filterCategory] : undefined,
      offset: page * LIMIT,
      limit: LIMIT,
    });
  }, [fetchProducts, search, filterCategory, page]);

  useEffect(() => { if (isAuthenticated) void fetchCategories(); }, [isAuthenticated, fetchCategories]);
  useEffect(() => { if (isAuthenticated) loadProducts(); }, [isAuthenticated, loadProducts]);

  useEffect(() => { setPage(0); }, [search, filterCategory]);

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Productos"
        breadcrumbs={[{ label: 'Productos' }]}
      >
        <BackofficeProductsFilters
          search={search}
          onSearchChange={setSearch}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          categories={categories}
        />

        <p className="text-xs font-semibold mb-4" style={{ color: 'var(--on-surface-muted)' }}>
          {isLoading ? 'Cargando...' : `${total} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </p>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        )}

        <BackofficeProductsTable
          isLoading={isLoading}
          products={products}
          categories={categories}
          search={search}
          filterCategory={filterCategory}
        />

        {!isLoading && (
          <BackofficePagination
            page={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
