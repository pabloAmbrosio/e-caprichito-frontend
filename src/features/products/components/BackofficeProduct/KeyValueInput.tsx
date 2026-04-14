import type { Dispatch, SetStateAction } from 'react';

interface KVPair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  pairs: KVPair[];
  onChange: Dispatch<SetStateAction<KVPair[]>>;
}

function PlusSmIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function KeyValueInput({ pairs, onChange }: KeyValueInputProps) {
  const add = () => onChange((prev) => [...prev, { key: '', value: '' }]);

  const update = (i: number, field: 'key' | 'value', val: string) => {
    onChange((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  const remove = (i: number) => {
    onChange((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={pair.key}
            onChange={(e) => update(i, 'key', e.target.value)}
            placeholder="Atributo (ej: talla)"
            className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0 transition-all"
            style={{
              background: 'var(--surface-raised)',
              borderColor: 'var(--stroke)',
              color: 'var(--on-surface)',
            }}
          />
          <span className="text-on-surface-muted/50 font-bold">:</span>
          <input
            type="text"
            value={pair.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            placeholder="Valor (ej: M)"
            className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0 transition-all"
            style={{
              background: 'var(--surface-raised)',
              borderColor: 'var(--stroke)',
              color: 'var(--on-surface)',
            }}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-pink/10 hover:text-pink shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50"
            style={{ color: 'var(--on-surface-muted)' }}
            aria-label="Eliminar atributo"
          >
            <XIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-turquoise/10 hover:text-turquoise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
        style={{ color: 'var(--on-surface-muted)' }}
      >
        <PlusSmIcon />
        Añadir atributo
      </button>
    </div>
  );
}
