import { useEffect, useRef } from 'react';
import type { CategoryTreeNode } from '../../domain/types';
import type { FiltersState } from '../../hooks/useProductsPage';
import { ProductFilters } from './ProductFilters';

interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FiltersState;
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  onClear: () => void;
  categoryTree: CategoryTreeNode[];
  activeFilterCount: number;
  total: number;
}

export function ProductFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClear,
  categoryTree,
  activeFilterCount,
  total,
}: ProductFilterDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // ── Focus management ──
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Escape key ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Focus trap ──
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de productos"
        className={`fixed top-0 right-0 h-full w-[min(22rem,88vw)] bg-[#1A1A2E] z-[70] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Gradient stripe ── */}
        <div
          className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
          aria-hidden="true"
        />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-turquoise" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-white font-extrabold text-base">Filtros</h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer"
            aria-label="Cerrar filtros"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Filter content ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <ProductFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClear={onClear}
            categoryTree={categoryTree}
            activeFilterCount={activeFilterCount}
            variant="dark"
          />
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 px-5 py-4 border-t border-white/10 flex gap-3">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onClear();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors duration-150 cursor-pointer"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-extrabold text-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_0.75rem_rgba(240,23,122,0.35)]"
            style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
          >
            Ver {total} producto{total !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </>
  );
}
