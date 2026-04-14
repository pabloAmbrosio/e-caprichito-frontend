import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeOrderDetail } from '@/features/orders/hooks/useBackofficeOrderDetail';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { BackofficeCancelOrderResult } from '@/features/orders/domain/types';

const ORDER_STATUS_CONFIG = {
  PENDING:   { label: 'Pendiente',  bg: 'rgba(255,214,0,0.12)',  color: '#FFD600' },
  CONFIRMED: { label: 'Confirmada', bg: 'rgba(0,197,212,0.12)',   color: '#00C5D4' },
  SHIPPED:   { label: 'En camino',  bg: 'rgba(255,122,0,0.12)',   color: '#FF7A00' },
  DELIVERED: { label: 'Entregada',  bg: 'rgba(0,197,100,0.12)',   color: '#00C564' },
  CANCELLED: { label: 'Cancelada',  bg: 'rgba(240,23,122,0.08)',  color: '#F0177A' },
} as const;

const PAYMENT_STATUS_CONFIG = {
  PENDING:         { label: 'Sin pago',    color: 'rgba(255,255,255,0.4)' },
  AWAITING_REVIEW: { label: 'En revisión', color: '#F0177A' },
  APPROVED:        { label: 'Aprobado',    color: '#00C5D4' },
  REJECTED:        { label: 'Rechazado',   color: '#F0177A' },
  EXPIRED:         { label: 'Expirado',    color: 'rgba(255,255,255,0.3)' },
  REFUNDED:        { label: 'Reembolsado', color: '#FF7A00' },
  CANCELLED:       { label: 'Cancelado',   color: 'rgba(255,255,255,0.3)' },
} as const;

const CUSTOMER_ROLE_LABELS: Record<string, string> = {
  MEMBER: 'Miembro', VIP_FAN: 'VIP Fan', VIP_LOVER: 'VIP Lover', VIP_LEGEND: 'VIP Legend',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtMoney(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function isCancellable(status: string): boolean {
  return status === 'PENDING' || status === 'CONFIRMED' || status === 'SHIPPED';
}

function SectionCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>
          {number}
        </span>
        <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function OrdenDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { order, isLoading, isSaving, error, fetchOrder, cancelOrder } = useBackofficeOrderDetail();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelResult, setCancelResult] = useState<BackofficeCancelOrderResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !id || typeof id !== 'string') return;
    void fetchOrder(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      const result = await cancelOrder(order.id, cancelReason.trim() || undefined);
      setCancelResult(result);
      setShowCancelModal(false);
      setCancelReason('');
    } catch {
      // error shown in UI via hook state
    }
  };

  const canCancel = order ? isCancellable(order.status) : false;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title={order ? `Orden ${order.id.slice(0, 8)}…` : 'Detalle de Orden'}
        breadcrumbs={[
          { label: 'Órdenes', href: '/backoffice/orders' },
          { label: order?.id.slice(0, 8) ?? '…' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-3xl flex flex-col gap-5">
            {[1,2,3].map((i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        ) : order ? (
          <div className="max-w-3xl flex flex-col gap-5">

            {/* Error de acción */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold"
                style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
                {error}
              </div>
            )}

            {/* Header */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }} aria-hidden="true" />
              <div className="p-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-muted)' }}>
                    ID de orden
                  </p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--on-surface)' }}>{order.id}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>{fmt(order.createdAt)}</p>
                  {order.expiresAt && order.status === 'PENDING' && (
                    <p className="text-xs mt-1 font-semibold" style={{ color: '#FFD600' }}>
                      Expira: {fmt(order.expiresAt)}
                    </p>
                  )}
                </div>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: ORDER_STATUS_CONFIG[order.status]?.bg, color: ORDER_STATUS_CONFIG[order.status]?.color }}>
                  {ORDER_STATUS_CONFIG[order.status]?.label ?? order.status}
                </span>
              </div>
            </div>

            {/* Cliente */}
            <SectionCard number="1" title="Cliente">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Usuario', value: order.customer.username },
                  { label: 'Email', value: order.customer.email ?? '—' },
                  { label: 'Teléfono', value: order.customer.phone ?? '—' },
                  { label: 'Nivel', value: order.customer.customerRole ? (CUSTOMER_ROLE_LABELS[order.customer.customerRole] ?? order.customer.customerRole) : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>{label}</p>
                    <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Items */}
            <SectionCard number="2" title="Productos">
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                    style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
                        {item.product.abstractProduct?.title ?? item.product.title}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'var(--on-surface-muted)' }}>
                        SKU: {item.product.sku}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-sm">
                      <span style={{ color: 'var(--on-surface-muted)' }}>×{item.quantity}</span>
                      <span className="font-bold" style={{ color: 'var(--on-surface)' }}>
                        {fmtMoney(item.product.priceInCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5 pt-3 border-t mt-2" style={{ borderColor: 'var(--stroke)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--on-surface-muted)' }}>Subtotal</span>
                    <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>{fmtMoney(order.subtotal)}</span>
                  </div>
                  {order.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#4CAF50' }}>Descuento</span>
                      <span className="font-bold" style={{ color: '#4CAF50' }}>-{fmtMoney(order.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--on-surface-muted)' }}>Envio</span>
                    <span className="font-semibold" style={{ color: order.deliveryFee === 0 ? '#4CAF50' : 'var(--on-surface)' }}>
                      {order.deliveryFee === 0 ? 'GRATIS' : `+${fmtMoney(order.deliveryFee)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1.5 border-t" style={{ borderColor: 'var(--stroke)' }}>
                    <span className="font-extrabold" style={{ color: 'var(--on-surface)' }}>Total</span>
                    <span className="font-extrabold" style={{ color: '#00C5D4' }}>{fmtMoney(order.total)}</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Pagos */}
            {order.payments.length > 0 && (
              <SectionCard number="3" title="Pagos">
                <div className="flex flex-col gap-3">
                  {order.payments.map((p) => {
                    const pCfg = PAYMENT_STATUS_CONFIG[p.status as keyof typeof PAYMENT_STATUS_CONFIG];
                    return (
                      <div key={p.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'var(--surface-overlay)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                            {fmtMoney(p.amount)} — {p.method === 'CASH_ON_DELIVERY' ? 'Pago al recibir' : 'Transferencia'}
                          </span>
                          <span className="text-xs font-bold" style={{ color: pCfg?.color }}>
                            {pCfg?.label ?? p.status}
                          </span>
                        </div>
                        {p.reviewer && (
                          <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                            Revisado por <strong>{p.reviewer.username}</strong>
                            {p.reviewedAt && <> el {fmt(p.reviewedAt)}</>}
                          </p>
                        )}
                        {p.reviewNote && (
                          <p className="text-xs mt-1 italic" style={{ color: 'var(--on-surface-muted)' }}>
                            "{p.reviewNote}"
                          </p>
                        )}
                        <div className="mt-2">
                          <Link href={`/backoffice/payments/${p.id}`}
                            className="text-xs font-bold hover:text-turquoise transition-colors"
                            style={{ color: 'var(--on-surface-muted)' }}>
                            Ver detalle del pago →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Envio */}
            {order.shipment && (
              <SectionCard number="4" title="Envio">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Tipo', value: order.shipment.type === 'PICKUP' ? 'Recoger en tienda' : order.shipment.type === 'HOME_DELIVERY' ? 'A domicilio' : 'Paqueteria' },
                    { label: 'Estado', value: order.shipment.status },
                    { label: 'Dirección', value: order.shipment.address?.formattedAddress ?? '—' },
                    { label: 'Fee', value: fmtMoney(order.shipment.deliveryFee) },
                    ...(order.shipment.carrier ? [{ label: 'Paqueteria', value: order.shipment.carrier }] : []),
                    ...(order.shipment.trackingCode ? [{ label: 'Guia', value: order.shipment.trackingCode }] : []),
                    { label: 'Entregado', value: order.shipment.deliveredAt ? fmt(order.shipment.deliveredAt) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>{label}</p>
                      <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Shipment events timeline */}
                {order.shipment.events.length > 0 && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--stroke)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--on-surface-muted)' }}>
                      Timeline de envio
                    </p>
                    <div className="relative pl-4">
                      <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: 'var(--stroke)' }} aria-hidden="true" />
                      <div className="flex flex-col gap-3">
                        {order.shipment.events.map((event) => (
                          <div key={event.id} className="relative flex flex-col gap-0.5">
                            <div className="absolute -left-[1.125rem] top-1 w-2.5 h-2.5 rounded-full border-2"
                              style={{ background: '#00C5D4', borderColor: '#0D0D1A' }} aria-hidden="true" />
                            <span className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                              {event.status}
                            </span>
                            {event.note && (
                              <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>{event.note}</span>
                            )}
                            <span className="text-xs" style={{ color: 'var(--on-surface-muted)', opacity: 0.6 }}>
                              {fmt(event.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Promociones aplicadas */}
            {order.promotionUsages.length > 0 && (
              <SectionCard number="5" title="Promociones Aplicadas">
                <div className="flex flex-col gap-2">
                  {order.promotionUsages.map((pu) => (
                    <div key={pu.id} className="flex items-center justify-between text-sm">
                      <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                        {pu.promotion.name}
                        {pu.promotion.couponCode && (
                          <span className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}>
                            {pu.promotion.couponCode}
                          </span>
                        )}
                      </span>
                      <span className="font-bold" style={{ color: '#F0177A' }}>
                        -{fmtMoney(pu.discountAmountInCents)}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Historial de status */}
            {order.statusAuditLogs.length > 0 && (
              <SectionCard number="6" title="Historial de Estado">
                <div className="relative pl-4">
                  <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: 'var(--stroke)' }} aria-hidden="true" />
                  <div className="flex flex-col gap-4">
                    {order.statusAuditLogs.map((log) => (
                      <div key={log.id} className="relative flex flex-col gap-0.5">
                        <div className="absolute -left-[1.125rem] top-1 w-2.5 h-2.5 rounded-full border-2"
                          style={{ background: '#00C5D4', borderColor: '#0D0D1A' }} aria-hidden="true" />
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                            {ORDER_STATUS_CONFIG[log.previousStatus]?.label ?? log.previousStatus}
                          </span>
                          <span style={{ color: 'var(--on-surface-muted)', opacity: 0.5 }}>→</span>
                          <span className="font-bold" style={{ color: ORDER_STATUS_CONFIG[log.newStatus]?.color ?? 'var(--on-surface)' }}>
                            {ORDER_STATUS_CONFIG[log.newStatus]?.label ?? log.newStatus}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                          por <strong>{log.changedByUser.username}</strong> · {fmt(log.changedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Resultado de cancelación */}
            {cancelResult && (
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(240,23,122,0.2)', background: 'rgba(240,23,122,0.04)' }}>
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #F0177A, #C0005A)' }} aria-hidden="true" />
                <div className="p-5 flex flex-col gap-2">
                  <p className="text-sm font-bold" style={{ color: '#F0177A' }}>
                    Orden cancelada exitosamente
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                    <span>Estado anterior: <strong>{ORDER_STATUS_CONFIG[cancelResult.previousStatus]?.label ?? cancelResult.previousStatus}</strong></span>
                    {cancelResult.shipmentFailed && (
                      <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,122,0,0.12)', color: '#FF7A00' }}>
                        Envío cancelado
                      </span>
                    )}
                    {cancelResult.paymentCancelled && (
                      <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,122,0,0.12)', color: '#FF7A00' }}>
                        Pago cancelado
                      </span>
                    )}
                  </div>
                  {cancelResult.reason && (
                    <p className="text-xs italic" style={{ color: 'var(--on-surface-muted)' }}>
                      Motivo: &quot;{cancelResult.reason}&quot;
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            {canCancel && (
              <SectionCard number="7" title="Acciones">
                <div className="flex flex-col gap-3">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--on-surface-muted)' }}>
                    El estado de la orden se actualiza automáticamente al aprobar pagos y avanzar envíos.
                  </p>
                  <div>
                    <button
                      onClick={() => { setShowCancelModal(true); }}
                      className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(240,23,122,0.08)', color: '#F0177A', border: '1px solid rgba(240,23,122,0.2)' }}
                    >
                      Cancelar orden
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        ) : null}

        {/* Modal de cancelación */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm" onClick={() => { setShowCancelModal(false); }} aria-hidden="true" />
            <div className="relative rounded-2xl border overflow-hidden w-full max-w-md"
              style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #F0177A, #C0005A)' }} aria-hidden="true" />
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(240,23,122,0.12), rgba(240,23,122,0.04))' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#F0177A' }}>
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold" style={{ color: 'var(--on-surface)' }}>
                      Cancelar orden
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--on-surface-muted)' }}>
                      Esta acción cancelará la orden, marcará el envío como fallido y cancelará pagos pendientes.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="cancel-reason" className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--on-surface-muted)' }}>
                    Motivo (opcional)
                  </label>
                  <textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => { setCancelReason(e.target.value); }}
                    maxLength={500}
                    rows={3}
                    placeholder="Ej: Cliente solicitó cancelación por teléfono"
                    className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink/40"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface)' }}
                  />
                  {cancelReason.length > 0 && (
                    <p className="text-xs mt-1 text-right" style={{ color: 'var(--on-surface-muted)', opacity: 0.6 }}>
                      {cancelReason.length}/500
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold"
                    style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
                    style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => { void handleCancelOrder(); }}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
                  >
                    {isSaving ? 'Cancelando…' : 'Confirmar cancelación'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
