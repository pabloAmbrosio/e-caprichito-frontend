import Link from 'next/link';
import { AccountLayout } from '@/shared/layouts/AccountLayout';
import { ProtectedRoute } from '@/features/auth';
import { useMyFavorites, ProductCard } from '@/features/products';

export default function MisFavoritosPage() {
  const { favorites, total, isLoading, error, unlike, loadMore, hasMore } = useMyFavorites(20);

  return (
    <ProtectedRoute>
      <AccountLayout title="Mis Favoritos">
        {/* Header count */}
        {!isLoading && total > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <span
              className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
            >
              {total}
            </span>
            <p className="text-sm text-on-surface-muted font-semibold">
              producto{total !== 1 ? 's' : ''} guardado{total !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 text-pink text-sm font-semibold mb-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array<undefined>(8)].map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-stroke rounded-2xl overflow-hidden animate-pulse"
                aria-hidden="true"
              >
                <div className="aspect-square bg-surface-overlay" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="w-16 h-2.5 rounded-full bg-surface-overlay" />
                  <div className="w-full h-3 rounded-full bg-surface-overlay" />
                  <div className="w-20 h-3 rounded-full bg-surface-overlay" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && favorites.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="relative">
              <span className="text-6xl block" aria-hidden="true">
                🤍
              </span>
              <span
                className="absolute -bottom-1 -right-2 flex items-center justify-center w-7 h-7 rounded-full text-sm"
                style={{ background: 'linear-gradient(135deg, rgba(240,23,122,0.15), rgba(240,23,122,0.05))' }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-pink">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4Z" />
                </svg>
              </span>
            </div>
            <div>
              <p className="text-lg font-extrabold text-on-surface">No tienes favoritos</p>
              <p className="text-sm text-on-surface-muted mt-1">
                Guarda los productos que mas te gusten para encontrarlos facilmente.
              </p>
            </div>
            <Link
              href="/"
              className="mt-1 inline-block px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
            >
              Explorar la tienda
            </Link>
          </div>
        )}

        {/* Products grid */}
        {!isLoading && favorites.length > 0 && (
          <>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              role="list"
              aria-label="Productos favoritos"
            >
              {favorites.map((product) => (
                <div key={product.id} className="relative group" role="listitem">
                  <ProductCard product={product} />

                  {/* Unlike button */}
                  <button
                    onClick={() => void unlike(product.id)}
                    aria-label={`Quitar ${product.title} de favoritos`}
                    className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 dark:bg-[#1A1A2E]/90 text-pink shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:scale-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-stroke text-sm font-bold text-on-surface hover:bg-surface-overlay hover:border-turquoise/30 hover:shadow-[0_0_0_3px_rgba(0,197,212,0.06)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
                >
                  Cargar mas favoritos
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-on-surface-muted group-hover:text-turquoise transition-colors duration-200" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </AccountLayout>
    </ProtectedRoute>
  );
}

