interface OrdersPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrdersPagination({ page, totalPages, onPageChange }: OrdersPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6 pt-5 border-t border-stroke">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-on-surface-muted hover:bg-surface-overlay hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
        aria-label="Pagina anterior"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
        </svg>
        Anterior
      </button>
      <span className="text-sm font-semibold text-on-surface-muted tabular-nums">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-on-surface-muted hover:bg-surface-overlay hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
        aria-label="Pagina siguiente"
      >
        Siguiente
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
