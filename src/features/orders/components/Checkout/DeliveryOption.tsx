import type { ReactNode } from 'react';

interface DeliveryOptionProps {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: string;
  children?: ReactNode;
}

export function DeliveryOption({
  selected,
  onClick,
  icon,
  label,
  badge,
  children,
}: DeliveryOptionProps) {
  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? 'border-turquoise bg-turquoise/5'
          : 'border-stroke bg-surface hover:border-turquoise/30'
      }`}
    >
      {/* Clickable header */}
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-5 outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="flex items-center gap-3.5">
          {/* Radio indicator */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
              selected ? 'border-turquoise' : 'border-on-surface-muted/30'
            }`}
          >
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-turquoise" />}
          </div>

          {/* Icon */}
          <span className="text-xl" aria-hidden="true">{icon}</span>

          {/* Label */}
          <span className="text-sm font-extrabold text-on-surface">{label}</span>

          {/* Badge */}
          {badge && (
            <span className="text-[0.625rem] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </button>

      {/* Expandable content — outside button to allow interactive children */}
      {selected && children && (
        <div className="px-5 pb-5 -mt-1">{children}</div>
      )}
    </div>
  );
}
