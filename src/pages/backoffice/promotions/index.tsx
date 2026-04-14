import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficePromotions } from '@/features/promotions/hooks/useBackofficePromotions';
import { useAuthStore } from '@/features/auth/store/authStore';

const LIMIT = 20;

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'short' });
}

const HEADERS = ['Nombre', 'Cupón', 'Vigencia', 'Activa', 'Usos', 'Prioridad', ''];

export default function PromocionesPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { promotions, isLoading, error, fetchPromotions, deletePromotion } = useBackofficePromotions();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback((p: number, s: string, active: boolean | undefined) => {
    void fetchPromotions({ page: p, limit: LIMIT, ...(s && { search: s }), ...(active !== undefined && { isActive: active }) });
  }, [fetchPromotions]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) load(1, '', undefined); }, [isAuthenticated]);

  const handleSearch = () => {
    setSearchVal(searchInput);
    setPage(1);
    load(1, searchInput, activeFilter);
  };

  const handleActiveFilter = (val: string) => {
    const parsed = val === '' ? undefined : val === 'true';
    setActiveFilter(parsed);
    setPage(1);
    load(1, searchVal, parsed);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deletePromotion(id);
      setDeleteId(null);
    } catch {
      // error handled by hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout title="Promociones" breadcrumbs={[{ label: 'Promociones' }]}>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar promoción…"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
              style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
            />
            <button onClick={handleSearch}
              className="px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)', color: '#fff' }}>
              Buscar
            </button>
          </div>
          <select
            value={activeFilter === undefined ? '' : String(activeFilter)}
            onChange={(e) => { handleActiveFilter(e.target.value); }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40"
            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}>
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
          <Link href="/backoffice/promotions/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva promoción
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl border text-sm font-semibold mb-6"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
              ))}
            </div>
          ) : promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} aria-hidden="true">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>No hay promociones</p>
              <Link href="/backoffice/promotions/new"
                className="mt-1 text-sm font-bold transition-colors hover:opacity-80"
                style={{ color: '#00C5D4' }}>
                Crear la primera →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                  {HEADERS.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider"
                      style={{ color: 'var(--on-surface-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id}
                    className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
                    style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold" style={{ color: 'var(--on-surface)' }}>{promo.name}</span>
                        {promo.description && (
                          <span className="text-xs truncate max-w-[200px]" style={{ color: 'var(--on-surface-muted)' }}>
                            {promo.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {promo.couponCode ? (
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}>
                          {promo.couponCode}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                      {fmt(promo.startsAt)}
                      {promo.endsAt && <> → {fmt(promo.endsAt)}</>}
                      {!promo.endsAt && <> → <span style={{ color: '#00C5D4' }}>Sin límite</span></>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          background: promo.isActive ? 'rgba(0,197,212,0.12)' : 'rgba(255,255,255,0.06)',
                          color: promo.isActive ? '#00C5D4' : 'rgba(255,255,255,0.3)',
                        }}>
                        {promo.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold tabular-nums" style={{ color: 'var(--on-surface)' }}>
                        {promo._count.usages}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                      {promo.priority}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/backoffice/promotions/${promo.id}`}
                          className="text-xs font-bold hover:text-turquoise transition-colors"
                          style={{ color: 'var(--on-surface-muted)' }}>
                          Editar
                        </Link>
                        {deleteId === promo.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => { void handleDelete(promo.id); }} disabled={deleting}
                              className="text-xs font-bold transition-colors hover:opacity-70 disabled:opacity-50"
                              style={{ color: '#F0177A' }}>
                              {deleting ? '…' : '✓'}
                            </button>
                            <button onClick={() => { setDeleteId(null); }}
                              className="text-xs font-bold transition-colors hover:opacity-70"
                              style={{ color: 'var(--on-surface-muted)' }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setDeleteId(promo.id); }}
                            className="text-xs font-bold transition-colors hover:opacity-70"
                            style={{ color: 'rgba(240,23,122,0.5)' }}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && promotions.length === LIMIT && (
          <div className="flex justify-end mt-6">
            <button onClick={() => { const p = page + 1; setPage(p); load(p, searchVal, activeFilter); }}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40"
              style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}>
              Siguiente →
            </button>
          </div>
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
