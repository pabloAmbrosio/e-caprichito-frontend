interface Props {
  message?: string;
}

export function CartEmptyState({ message = 'No hay carritos' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }}
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
        {message}
      </p>
    </div>
  );
}
