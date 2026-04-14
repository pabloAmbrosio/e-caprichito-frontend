interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function CartsPagination({ page, totalPages, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40 disabled:opacity-30"
        style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}
      >
        ← Anterior
      </button>
      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--on-surface-muted)' }}>
        Página {page} de {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40 disabled:opacity-30"
        style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}
      >
        Siguiente →
      </button>
    </div>
  );
}
