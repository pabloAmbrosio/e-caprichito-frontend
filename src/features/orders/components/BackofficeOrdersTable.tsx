import Link from 'next/link';
import type { OrderStatus } from '@/shared/types/enums';
import type { BackofficeOrderListItem } from '../domain/types';

const ORDER_STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', bg: 'rgba(255,214,0,0.12)', color: '#FFD600' },
    CONFIRMED: { label: 'Confirmada', bg: 'rgba(0,197,212,0.12)', color: '#00C5D4' },
    SHIPPED: { label: 'En camino', bg: 'rgba(255,122,0,0.12)', color: '#FF7A00' },
    DELIVERED: { label: 'Entregada', bg: 'rgba(0,197,100,0.12)', color: '#00C564' },
    CANCELLED: { label: 'Cancelada', bg: 'rgba(240,23,122,0.08)', color: '#F0177A' },
} as const;

const PAYMENT_STATUS_CONFIG = {
    PENDING: { label: 'Sin pago', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
    AWAITING_REVIEW: { label: 'En revisión', bg: 'rgba(240,23,122,0.15)', color: '#F0177A' },
    APPROVED: { label: 'Pagado', bg: 'rgba(0,197,212,0.12)', color: '#00C5D4' },
    REJECTED: { label: 'Rechazado', bg: 'rgba(240,23,122,0.08)', color: '#F0177A' },
    EXPIRED: { label: 'Expirado', bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' },
    REFUNDED: { label: 'Reembolsado', bg: 'rgba(255,122,0,0.08)', color: '#FF7A00' },
} as const;

function fmt(iso: string) {
    return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}
function fmtMoney(centavos: number) {
    return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

const HEADERS = ['Fecha', 'Cliente', 'Items', 'Total', 'Estado', 'Pago', ''];

interface Props {
    isLoading: boolean;
    orders: BackofficeOrderListItem[];
}

export function BackofficeOrdersTable({ isLoading, orders }: Props) {
    return (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            {isLoading ? (
                <div className="flex flex-col gap-3 p-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} aria-hidden="true">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                    </svg>
                    <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>No hay órdenes</p>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                            {HEADERS.map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider"
                                    style={{ color: 'var(--on-surface-muted)' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const oStatus = ORDER_STATUS_CONFIG[order.status as OrderStatus] ?? ORDER_STATUS_CONFIG.PENDING;
                            const lastPayment = order.payments[order.payments.length - 1];
                            const pStatus = lastPayment
                                ? (PAYMENT_STATUS_CONFIG[lastPayment.status as keyof typeof PAYMENT_STATUS_CONFIG] ?? PAYMENT_STATUS_CONFIG.PENDING)
                                : PAYMENT_STATUS_CONFIG.PENDING;
                            return (
                                <tr key={order.id}
                                    className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)] cursor-pointer"
                                    style={{ borderColor: 'var(--stroke)' }}
                                >
                                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--on-surface-muted)' }}>
                                        {fmt(order.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                                                {order.customer.username}
                                            </span>
                                            {order.customer.phone && (
                                                <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                                                    {order.customer.phone}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold"
                                            style={{ background: 'var(--surface-overlay)', color: 'var(--on-surface)' }}>
                                            {order._count.items}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--on-surface)' }}>
                                        {fmtMoney(order.total)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
                                            style={{ background: oStatus.bg, color: oStatus.color }}>
                                            {oStatus.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
                                            style={{ background: pStatus.bg, color: pStatus.color }}>
                                            {pStatus.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/backoffice/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-xs font-bold transition-colors duration-150 hover:text-turquoise"
                                            style={{ color: 'var(--on-surface-muted)' }}
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            Ver
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
