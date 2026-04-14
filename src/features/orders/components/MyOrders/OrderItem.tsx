import Link from 'next/link';
import type { MyOrder } from '../../domain/types';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR_CLASS,
  ORDER_STATUS_ICON,
  DELIVERY_TYPE_LABEL,
  DELIVERY_TYPE_COLOR_CLASS,
} from '../../domain/orderStatusMappings';

interface OrderItemProps {
  order: MyOrder;
}

function getDisplayTotal(order: MyOrder): number {
  if (typeof order.total === 'number' && !Number.isNaN(order.total)) return order.total;
  // Fallback: sum items when backend list doesn't include total
  return order.items.reduce((sum, i) => sum + i.product.priceInCents * i.quantity, 0);
}

export function OrderItem({ order }: OrderItemProps) {
  const displayTotal = getDisplayTotal(order);

  return (
    <Link
      href={`/account/orders/${order.id}`}
      role="listitem"
      className="group bg-surface border border-stroke rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-turquoise/30 hover:shadow-[0_0_0_3px_rgba(0,197,212,0.08)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
      aria-label={`Pedido ${order.id.slice(0, 8)}, ${ORDER_STATUS_LABEL[order.status]}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Status icon */}
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-xl text-base shrink-0 ${ORDER_STATUS_COLOR_CLASS[order.status]}`}
          aria-hidden="true"
        >
          {ORDER_STATUS_ICON[order.status]}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-mono text-on-surface-muted">
            #{order.id.slice(0, 8)}...
          </span>
          <span className="text-sm font-bold text-on-surface truncate">
            {order.items.length} articulo{order.items.length !== 1 ? 's' : ''}
            {order.items[0] && (
              <span className="text-on-surface-muted font-normal">
                {' '}
                — {order.items[0].product.title}
                {order.items.length > 1 && ` y ${order.items.length - 1} mas`}
              </span>
            )}
          </span>
          <span className="text-xs text-on-surface-muted">
            {new Date(order.createdAt).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 sm:pl-3 flex-wrap justify-end">
        {order.shipment && (
          <span
            className={`px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${DELIVERY_TYPE_COLOR_CLASS[order.shipment.type]}`}
          >
            {DELIVERY_TYPE_LABEL[order.shipment.type]}
          </span>
        )}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLOR_CLASS[order.status]}`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
        <span className="text-base font-extrabold text-on-surface tabular-nums">
          ${(displayTotal / 100).toFixed(2)}
        </span>
        <span
          className="text-on-surface-muted group-hover:text-turquoise group-hover:translate-x-0.5 transition-all duration-200"
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
