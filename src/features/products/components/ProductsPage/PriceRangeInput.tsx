interface PriceRangeInputProps {
  minPrice: string;
  maxPrice: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  variant?: 'light' | 'dark';
}

export function PriceRangeInput({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  variant = 'light',
}: PriceRangeInputProps) {
  const isDark = variant === 'dark';

  const inputClasses = [
    'w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200',
    'focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1',
    isDark
      ? 'bg-white/[0.08] border border-white/15 text-white placeholder:text-white/35 focus-visible:ring-offset-[#1A1A2E]'
      : 'bg-surface border border-stroke text-on-surface placeholder:text-on-surface-muted/50 focus-visible:ring-offset-surface',
  ].join(' ');

  const labelClasses = isDark ? 'text-white/50 text-[0.625rem]' : 'text-on-surface-muted text-[0.625rem]';

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <label className={`block font-bold uppercase tracking-wider mb-1 ${labelClasses}`}>
          Mínimo
        </label>
        <div className="relative">
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
              isDark ? 'text-white/35' : 'text-on-surface-muted/50'
            }`}
          >
            $
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => onMinChange(e.target.value)}
            className={`${inputClasses} pl-7`}
          />
        </div>
      </div>

      <span
        className={`pb-3 text-sm font-bold ${isDark ? 'text-white/30' : 'text-on-surface-muted/40'}`}
        aria-hidden="true"
      >
        –
      </span>

      <div className="flex-1">
        <label className={`block font-bold uppercase tracking-wider mb-1 ${labelClasses}`}>
          Máximo
        </label>
        <div className="relative">
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
              isDark ? 'text-white/35' : 'text-on-surface-muted/50'
            }`}
          >
            $
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => onMaxChange(e.target.value)}
            className={`${inputClasses} pl-7`}
          />
        </div>
      </div>
    </div>
  );
}
