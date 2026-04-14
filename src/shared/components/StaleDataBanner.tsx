interface StaleDataBannerProps {
  generatedAt: number;
}

export function StaleDataBanner({ generatedAt }: StaleDataBannerProps) {
  const generatedAtLabel = new Date(generatedAt).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 mt-4"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-yellow/40 bg-yellow/10 px-4 py-3 text-sm text-on-surface">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 shrink-0 mt-0.5 text-orange"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="flex-1">
          <p className="font-bold">Estamos teniendo problemas para actualizar el contenido</p>
          <p className="text-on-surface-muted">
            Lo que ves puede estar desactualizado. Última actualización: {generatedAtLabel}.
          </p>
        </div>
      </div>
    </div>
  );
}
