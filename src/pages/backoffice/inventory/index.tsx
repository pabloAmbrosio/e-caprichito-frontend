import { useEffect, useState, useCallback } from 'react';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeInventory } from '@/features/inventory/hooks/useBackofficeInventory';
import { useAuthStore } from '@/features/auth/store/authStore';

const LIMIT = 30;

const HEADERS = ['Producto', 'Físico', 'Reservado', 'Disponible'];

function StockBadge({ available }: { available: number }) {
  if (available === 0) {
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: 'rgba(240,23,122,0.12)', color: '#F0177A' }}>Sin stock</span>;
  }
  if (available <= 5) {
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: 'rgba(255,214,0,0.12)', color: '#FFD600' }}>Stock bajo ({available})</span>;
  }
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
    style={{ background: 'rgba(0,197,212,0.12)', color: '#00C5D4' }}>En stock ({available})</span>;
}

export default function InventarioPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { inventory, isLoading, error, fetchInventory, createInventory } = useBackofficeInventory();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);

  // Assign stock modal
  const [assignModal, setAssignModal] = useState<{ productId: string; productTitle: string } | null>(null);
  const [stockInput, setStockInput] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  const load = useCallback((p: number, s: string, oos: boolean) => {
    void fetchInventory({ page: p, limit: LIMIT, ...(s && { search: s }), outOfStock: oos || undefined });
  }, [fetchInventory]);

  // IMPORTANTE: usar [isAuthenticated] en lugar de [] como deps NO es un error.
  // React ejecuta efectos children-first (hijos antes que padres). Esto hace que
  // este useEffect corra ANTES que useSessionInit en _app.tsx, que es quien llama
  // a configureAuthFetch(). Con [] como deps, authFetch lanzaba "no configurado".
  // Al depender de isAuthenticated, el fetch solo corre cuando auth ya resolvió,
  // garantizando que configureAuthFetch() ya fue llamado. — 2026-02-26
  useEffect(() => {
    if (isAuthenticated) load(1, '', false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSearch = () => {
    setSearchVal(searchInput);
    setPage(1);
    load(1, searchInput, outOfStockOnly);
  };

  const toggleOutOfStock = (val: boolean) => {
    setOutOfStockOnly(val);
    setPage(1);
    load(1, searchVal, val);
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    const qty = parseInt(stockInput);
    if (isNaN(qty) || qty < 0) {
      setAssignError('Ingresa un número válido');
      return;
    }
    setAssignSaving(true);
    setAssignError('');
    try {
      await createInventory(assignModal.productId, qty);
      setAssignModal(null);
      setStockInput('');
      load(page, searchVal, outOfStockOnly);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Error al asignar stock');
    } finally {
      setAssignSaving(false);
    }
  };

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout title="Inventario" breadcrumbs={[{ label: 'Inventario' }]}>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar producto…"
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
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none"
            style={{ color: 'var(--on-surface-muted)' }}>
            <input type="checkbox" checked={outOfStockOnly}
              onChange={(e) => { toggleOutOfStock(e.target.checked); }}
              className="rounded accent-[#F0177A]" />
            Solo sin stock
          </label>
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
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
              ))}
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                No hay registros de inventario
              </p>
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
                {inventory.map((item) => (
                  <tr key={item.id}
                    className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
                    style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                        {item.product.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold tabular-nums" style={{ color: 'var(--on-surface)' }}>
                        {item.physicalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--on-surface-muted)' }}>
                        {item.reservedStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge available={item.availableStock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {!isLoading && (page > 1 || inventory.length === LIMIT) && (
          <div className="flex justify-end mt-6 gap-2">
            {page > 1 && (
              <button onClick={() => { const p = page - 1; setPage(p); load(p, searchVal, outOfStockOnly); }}
                className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40"
                style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}>
                ← Anterior
              </button>
            )}
            {inventory.length === LIMIT && (
              <button onClick={() => { const p = page + 1; setPage(p); load(p, searchVal, outOfStockOnly); }}
                className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40"
                style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}>
                Siguiente →
              </button>
            )}
          </div>
        )}

        {/* Modal asignar stock */}
        {assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D1A]/70 backdrop-blur-sm">
            <div className="rounded-2xl border max-w-sm w-full mx-4 overflow-hidden"
              style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A)' }} aria-hidden="true" />
              <div className="p-6">
                <h3 className="text-base font-extrabold mb-1" style={{ color: 'var(--on-surface)' }}>
                  Asignar stock
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--on-surface-muted)' }}>
                  {assignModal.productTitle}
                </p>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                    Stock físico inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockInput}
                    onChange={(e) => { setStockInput(e.target.value); }}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                {assignError && (
                  <p className="text-xs font-semibold mb-3" style={{ color: '#F0177A' }}>{assignError}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { void handleAssign(); }} disabled={assignSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}>
                    {assignSaving ? 'Guardando…' : 'Asignar'}
                  </button>
                  <button onClick={() => { setAssignModal(null); setStockInput(''); setAssignError(''); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold border hover:border-turquoise/40 transition-all"
                    style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
