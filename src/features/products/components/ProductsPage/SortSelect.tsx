import { SORT_OPTIONS } from '../../hooks/useProductsPage';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'appearance-none bg-surface border border-stroke rounded-xl',
          'pl-3.5 pr-9 py-2 text-sm font-semibold text-on-surface cursor-pointer',
          'outline-none transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
          'hover:border-turquoise/30',
        ].join(' ')}
        aria-label="Ordenar productos por"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Chevron */}
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted pointer-events-none"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
