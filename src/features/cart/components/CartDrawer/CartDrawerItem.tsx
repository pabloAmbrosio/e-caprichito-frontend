import type { DrawerDisplayItem } from '../../domain/types';

interface CartDrawerItemProps {
  item: DrawerDisplayItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

function formatPrice(value: number): string {
  return (value ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

export function CartDrawerItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving,
}: CartDrawerItemProps) {
  const handleDecrement = () => {
    if (item.quantity <= 1) {
      onRemove(item.productId);
    } else {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  return (
    <div
      className={`group/item relative flex gap-3.5 py-4 transition-opacity duration-200 ${
        isRemoving ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="w-[3.75rem] h-[3.75rem] rounded-xl overflow-hidden bg-white/5 shrink-0 ring-1 ring-white/10">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug pr-7">
          {item.title}
        </h4>

        <span className="text-xs font-extrabold text-turquoise mt-0.5">
          {formatPrice(item.unitPrice)}
        </span>

        {/* Stepper */}
        <div className="flex items-center gap-0 mt-2.5">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isUpdating}
            aria-label={item.quantity <= 1 ? `Eliminar ${item.title}` : `Reducir cantidad de ${item.title}`}
            className="w-7 h-7 flex items-center justify-center rounded-l-lg border border-white/15 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 focus-visible:ring-offset-[#1A1A2E] outline-none"
          >
            {item.quantity <= 1 ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-pink" aria-hidden="true">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3" aria-hidden="true">
                <path d="M5 12h14" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <span
            className="w-9 h-7 flex items-center justify-center border-y border-white/15 text-xs font-black text-white tabular-nums"
            aria-label={`Cantidad: ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isUpdating}
            aria-label={`Aumentar cantidad de ${item.title}`}
            className="w-7 h-7 flex items-center justify-center rounded-r-lg border border-white/15 text-white/60 hover:text-turquoise hover:bg-turquoise/10 transition-all duration-150 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 focus-visible:ring-offset-[#1A1A2E] outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          disabled={isRemoving}
          aria-label={`Eliminar ${item.title} del carrito`}
          className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-pink hover:bg-pink/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-turquoise outline-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <span className="text-xs font-extrabold text-white/80 tabular-nums">
          {formatPrice(item.lineTotal)}
        </span>
      </div>
    </div>
  );
}
