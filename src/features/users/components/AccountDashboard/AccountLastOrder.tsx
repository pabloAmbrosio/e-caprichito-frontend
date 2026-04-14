import Link from 'next/link';
import type { OrderStatus } from '@/shared/types/enums';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR_CLASS,
} from '@/features/orders/domain/orderStatusMappings';

interface AccountLastOrderProps {
  order: any | null;
  isLoading: boolean;
}

export function AccountLastOrder({ order, isLoading }: AccountLastOrderProps) {
  const totalFromItems = (order: any) =>
    order.items.reduce((sum: number, item: any) => sum + item.product.priceInCents * item.quantity, 0) / 100;

  return (
    <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-0">
        <h2 className="text-base font-extrabold text-on-surface">Último Pedido</h2>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-sm text-turquoise font-bold hover:text-turquoise-dark transition-colors duration-150"
        >
          Ver todos
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-20 h-3 rounded-full bg-surface-overlay animate-pulse" />
            <div className="w-16 h-5 rounded-full bg-surface-overlay animate-pulse" />
          </div>
          <div className="w-40 h-3 rounded-full bg-surface-overlay animate-pulse" />
        </div>
      ) : order ? (
        <Link
          href={`/account/orders/${order.id}`}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 hover:bg-surface-overlay/50 transition-colors duration-200"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-on-surface-muted font-mono">
              #{order.id.slice(0, 8)}...
            </span>
            <span className="text-sm font-bold text-on-surface">
              {order.items.length} articulo{order.items.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-on-surface-muted">
              {new Date(order.createdAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLOR_CLASS[order.status as OrderStatus]}`}
            >
              {ORDER_STATUS_LABEL[order.status as OrderStatus]}
            </span>
            <span className="text-base font-extrabold text-on-surface tabular-nums">
              ${totalFromItems(order).toFixed(2)}
            </span>
            <span
              className="text-on-surface-muted group-hover:text-turquoise group-hover:translate-x-0.5 transition-all duration-200"
              aria-hidden="true"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 text-center px-5">
          <span className="text-5xl" aria-hidden="true">
            📦
          </span>
          <div>
            <p className="text-on-surface font-bold mb-1">Sin pedidos todavia</p>
            <p className="text-sm text-on-surface-muted">
              Cuando hagas tu primera compra, aparecera aqui.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            Explorar tienda
          </Link>
        </div>
      )}
    </div>
  );
}
