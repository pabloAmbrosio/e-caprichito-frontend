import type { Address } from '../domain/types/Address';

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Delivery fee in centavos — shown as badge when selected and fee === 0 */
  deliveryFee?: number | null;
}

export function AddressCard({ address, selected, onSelect, onEdit, onDelete, deliveryFee }: AddressCardProps) {
  const isClickable = !!onSelect;

  return (
    <div
      role={isClickable ? 'radio' : undefined}
      aria-checked={isClickable ? selected : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(); } } : undefined}
      className={[
        'relative rounded-2xl border p-4 transition-all duration-200',
        isClickable ? 'cursor-pointer' : '',
        selected
          ? 'border-turquoise bg-turquoise/5 dark:bg-turquoise/8 shadow-[0_0_0_3px_rgba(0,197,212,0.1)]'
          : 'border-stroke bg-surface hover:border-turquoise/30 hover:shadow-[0_0_0_3px_rgba(0,197,212,0.06)]',
      ].join(' ')}
    >
      {/* Header: label + badges */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-sm font-extrabold text-on-surface">{address.label}</span>
        {address.isDefault && (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-turquoise/10 text-turquoise">
            Predeterminada
          </span>
        )}
        {selected && deliveryFee != null && deliveryFee === 0 && (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Envío gratis a tu zona
          </span>
        )}
        {selected && deliveryFee != null && deliveryFee > 0 && (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange/10 text-orange">
            Envío ${(deliveryFee / 100).toFixed(0)} MXN
          </span>
        )}
      </div>

      {/* Address text */}
      <p className="text-xs text-on-surface-muted leading-relaxed line-clamp-2">
        {address.formattedAddress}
      </p>

      {address.details && (
        <p className="text-xs text-on-surface-muted/70 mt-1 italic">
          {address.details}
        </p>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stroke">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-xs font-bold text-on-surface-muted hover:text-turquoise transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded px-1"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-xs font-bold text-on-surface-muted hover:text-pink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink rounded px-1"
            >
              Eliminar
            </button>
          )}
        </div>
      )}

      {/* Selection indicator */}
      {isClickable && (
        <div
          className={[
            'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            selected ? 'border-turquoise bg-turquoise' : 'border-stroke',
          ].join(' ')}
          aria-hidden="true"
        >
          {selected && (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white" aria-hidden="true">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
