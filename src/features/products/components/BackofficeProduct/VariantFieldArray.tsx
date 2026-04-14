import { useState, Dispatch, SetStateAction } from 'react';
import { KeyValueInput } from './KeyValueInput';

interface KVPair { key: string; value: string }

export interface VariantFormData {
  id?: string; // present when editing existing variant
  title: string;
  sku: string;
  priceDisplay: string; // pesos (will be multiplied x100)
  comparePriceDisplay: string;
  details: KVPair[];
}

interface VariantFieldArrayProps {
  variants: VariantFormData[];
  onChange: Dispatch<SetStateAction<VariantFormData[]>>;
  onDeleteExisting?: (variantId: string) => Promise<void>;
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

const emptyVariant = (): VariantFormData => ({
  title: '', sku: '', priceDisplay: '', comparePriceDisplay: '', details: [],
});

export function VariantFieldArray({ variants, onChange, onDeleteExisting }: VariantFieldArrayProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const add = () => {
    const newIdx = variants.length;
    onChange((prev) => [...prev, emptyVariant()]);
    setOpenIndex(newIdx);
  };

  const update = (i: number, field: keyof Omit<VariantFormData, 'details'>, value: string) => {
    onChange((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const updateDetails = (i: number, details: KVPair[] | ((prev: KVPair[]) => KVPair[])) => {
    onChange((prev) => prev.map((v, idx) => {
      if (idx !== i) return v;
      const newDetails = typeof details === 'function' ? details(v.details) : details;
      return { ...v, details: newDetails };
    }));
  };

  const remove = async (i: number) => {
    const variant = variants[i];
    if (variant?.id && onDeleteExisting) {
      setDeletingId(variant.id);
      try {
        await onDeleteExisting(variant.id);
      } finally {
        setDeletingId(null);
      }
    }
    onChange((prev) => prev.filter((_, idx) => idx !== i));
    if (openIndex >= i && openIndex > 0) setOpenIndex(openIndex - 1);
  };

  return (
    <div className="flex flex-col gap-3">
      {variants.map((variant, i) => {
        const isOpen = openIndex === i;
        const label = variant.title || `Variante ${i + 1}`;
        const isExisting = !!variant.id;
        const isOnlyVariant = variants.length === 1;

        return (
          <div
            key={i}
            className="rounded-xl border overflow-hidden transition-all duration-200"
            style={{
              borderColor: isOpen ? 'rgba(0,197,212,0.4)' : 'var(--stroke)',
              boxShadow: isOpen ? '0 0 0 3px rgba(0,197,212,0.06)' : 'none',
              background: 'var(--surface)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-turquoise/[0.02] transition-colors"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenIndex(isOpen ? -1 : i); }}
              aria-expanded={isOpen}
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
                  {label}
                </p>
                {variant.priceDisplay && (
                  <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                    ${variant.priceDisplay} MXN
                    {isExisting && (
                      <span className="ml-2 text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}>Guardada</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!isOnlyVariant && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void remove(i); }}
                    disabled={deletingId === variant.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-pink/10 hover:text-pink disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50"
                    style={{ color: 'var(--on-surface-muted)' }}
                    aria-label="Eliminar variante"
                  >
                    {deletingId === variant.id ? (
                      <span className="w-3 h-3 rounded-full border border-transparent border-t-pink animate-spin" />
                    ) : <TrashIcon />}
                  </button>
                )}
                <span style={{ color: 'var(--on-surface-muted)' }}><ChevronIcon open={isOpen} /></span>
              </div>
            </div>

            {/* Body */}
            {isOpen && (
              <div className="px-4 pb-5 pt-2 flex flex-col gap-4 border-t" style={{ borderColor: 'var(--stroke)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Título */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: 'var(--on-surface-muted)' }}>
                      Título <span className="text-pink">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.title}
                      onChange={(e) => update(i, 'title', e.target.value)}
                      placeholder="Ej: Talla S, Color Rojo..."
                      className="px-3 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all"
                      style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                    />
                  </div>

                  {/* SKU */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: 'var(--on-surface-muted)' }}>
                      SKU <span className="text-pink">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => update(i, 'sku', e.target.value)}
                      placeholder="Ej: CAMI-001-S"
                      className="px-3 py-2.5 rounded-xl border text-sm font-mono outline-none focus:ring-2 focus:ring-turquoise transition-all"
                      style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                    />
                  </div>

                  {/* Precio */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: 'var(--on-surface-muted)' }}>
                      Precio (MXN) <span className="text-pink">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--on-surface-muted)' }}>$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.priceDisplay}
                        onChange={(e) => update(i, 'priceDisplay', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                      />
                    </div>
                  </div>

                  {/* Precio comparativo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: 'var(--on-surface-muted)' }}>
                      Precio tachado (MXN)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--on-surface-muted)' }}>$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.comparePriceDisplay}
                        onChange={(e) => update(i, 'comparePriceDisplay', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>Aparece tachado en la tienda.</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold" style={{ color: 'var(--on-surface-muted)' }}>
                    Atributos adicionales
                  </label>
                  <KeyValueInput
                    pairs={variant.details}
                    onChange={(updater) => updateDetails(i, updater)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 border-2 border-dashed hover:border-turquoise hover:text-turquoise hover:bg-turquoise/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
        style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
      >
        <PlusIcon />
        Agregar variante
      </button>
    </div>
  );
}
