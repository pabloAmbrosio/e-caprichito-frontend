export function BackofficePagination({
    page,
    totalPages,
    onPageChange
}: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => { onPageChange(page - 1); }}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border transition-all duration-150 disabled:opacity-30 hover:border-turquoise/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
                    aria-label="Página anterior"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button
                    onClick={() => { onPageChange(page + 1); }}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl border transition-all duration-150 disabled:opacity-30 hover:border-turquoise/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}
                    aria-label="Página siguiente"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
