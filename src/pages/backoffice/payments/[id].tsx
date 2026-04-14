import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficePaymentDetail } from '@/features/payments/hooks/useBackofficePaymentDetail';
import { useAuthStore } from '@/features/auth/store/authStore';

const PAYMENT_STATUS_CONFIG = {
  PENDING:         { label: 'Sin pago',    bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
  AWAITING_REVIEW: { label: 'En revisión', bg: 'rgba(240,23,122,0.15)',  color: '#F0177A' },
  APPROVED:        { label: 'Aprobado',    bg: 'rgba(0,197,212,0.12)',   color: '#00C5D4' },
  REJECTED:        { label: 'Rechazado',   bg: 'rgba(240,23,122,0.08)',  color: '#F0177A' },
  EXPIRED:         { label: 'Expirado',    bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' },
  REFUNDED:        { label: 'Reembolsado', bg: 'rgba(255,122,0,0.08)',   color: '#FF7A00' },
  CANCELLED:       { label: 'Cancelado',   bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' },
} as const;

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtMoney(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: 'var(--on-surface-muted)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function PagoDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { payment, isLoading, isSaving, error, fetchPayment, reviewPayment } = useBackofficePaymentDetail();

  const [reviewMode, setReviewMode] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [note, setNote] = useState('');
  const [proofOpen, setProofOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id || typeof id !== 'string') return;
    void fetchPayment(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  const handleReview = async () => {
    if (!reviewMode || !payment) return;
    try {
      await reviewPayment(payment.id, reviewMode, note || undefined);
      setReviewMode(null);
      setNote('');
    } catch {
      // error shown in UI
    }
  };

  const pCfg = payment
    ? (PAYMENT_STATUS_CONFIG[payment.status as keyof typeof PAYMENT_STATUS_CONFIG] ?? PAYMENT_STATUS_CONFIG.PENDING)
    : null;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Detalle de Pago"
        breadcrumbs={[
          { label: 'Pagos', href: '/backoffice/payments' },
          { label: payment?.id.slice(0, 8) ?? '…' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-3xl flex flex-col gap-5">
            {[1,2,3].map((i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        ) : payment ? (
          <div className="max-w-3xl flex flex-col gap-5">

            {/* Header */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }} aria-hidden="true" />
              <div className="p-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-muted)' }}>Monto</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#00C5D4' }}>{fmtMoney(payment.amount)}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>
                    {payment.method === 'CASH_ON_DELIVERY' ? 'Pago al recibir' : 'Transferencia manual'} · {payment.currency?.toUpperCase() ?? 'MXN'} · {fmt(payment.createdAt)}
                  </p>
                </div>
                {pCfg && (
                  <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{ background: pCfg.bg, color: pCfg.color }}>
                    {pCfg.label}
                  </span>
                )}
              </div>
            </div>

            {/* Cliente */}
            <SectionCard title="Cliente">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Usuario', value: payment.customer.username },
                  { label: 'Email', value: payment.customer.email ?? '—' },
                  { label: 'Teléfono', value: payment.customer.phone ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>{label}</p>
                    <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Orden */}
            <SectionCard title="Orden Asociada">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>ID de orden</p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--on-surface)' }}>{payment.order.id}</p>
                </div>
                <Link href={`/backoffice/orders/${payment.order.id}`}
                  className="text-xs font-bold hover:text-turquoise transition-colors"
                  style={{ color: 'var(--on-surface-muted)' }}>
                  Ver orden →
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {payment.order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm border-t pt-2"
                    style={{ borderColor: 'var(--stroke)' }}>
                    <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                      {item.product.title}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span style={{ color: 'var(--on-surface-muted)' }}>×{item.quantity}</span>
                      <span className="font-bold" style={{ color: 'var(--on-surface)' }}>
                        {fmtMoney(item.product.priceInCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Comprobante */}
            {payment.providerData?.screenshotUrl && (
              <SectionCard title="Comprobante de Pago">
                <div className="flex flex-col gap-3">
                  {payment.providerData.bankReference && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Referencia bancaria</p>
                      <p className="font-mono text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                        {payment.providerData.bankReference}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--on-surface-muted)' }}>Imagen</p>
                    <button
                      onClick={() => { setProofOpen(true); }}
                      className="block overflow-hidden rounded-xl border transition-all hover:border-turquoise/40 hover:scale-[1.01]"
                      style={{ borderColor: 'var(--stroke)' }}
                    >
                      <img
                        src={payment.providerData.screenshotUrl}
                        alt="Comprobante de pago"
                        className="max-h-48 w-auto object-contain"
                      />
                    </button>
                    <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>
                      Click para ampliar
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Revisión anterior */}
            {payment.reviewer && (
              <SectionCard title="Revisión">
                <div className="text-sm flex flex-col gap-1">
                  <p style={{ color: 'var(--on-surface)' }}>
                    Revisado por <strong>{payment.reviewer.username}</strong>
                    {payment.reviewedAt && <> el {fmt(payment.reviewedAt)}</>}
                  </p>
                  {payment.reviewNote && (
                    <p className="italic" style={{ color: 'var(--on-surface-muted)' }}>
                      "{payment.reviewNote}"
                    </p>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Panel de acción */}
            {payment.status === 'AWAITING_REVIEW' && (
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(240,23,122,0.25)', background: 'var(--surface)' }}>
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #F0177A, #C0005A)' }} aria-hidden="true" />
                <div className="p-6">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: '#F0177A' }}>
                    ⚡ Revisar Pago
                  </h2>

                  {error && (
                    <div className="p-3 rounded-xl border text-sm font-semibold mb-4"
                      style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
                      {error}
                    </div>
                  )}

                  {reviewMode ? (
                    <div className="flex flex-col gap-4">
                      <div className="p-3 rounded-xl text-sm font-semibold"
                        style={{
                          background: reviewMode === 'APPROVE' ? 'rgba(0,197,212,0.08)' : 'rgba(240,23,122,0.08)',
                          color: reviewMode === 'APPROVE' ? '#00C5D4' : '#F0177A',
                        }}>
                        Vas a {reviewMode === 'APPROVE' ? 'APROBAR' : 'RECHAZAR'} el pago de {fmtMoney(payment.amount)}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                          style={{ color: 'var(--on-surface-muted)' }}>
                          Nota {reviewMode === 'REJECT' ? '(requerida)' : '(opcional)'}
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => { setNote(e.target.value); }}
                          rows={3}
                          placeholder={reviewMode === 'REJECT' ? 'Motivo del rechazo…' : 'Nota opcional…'}
                          className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all resize-none"
                          style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { void handleReview(); }}
                          disabled={isSaving || (reviewMode === 'REJECT' && !note.trim())}
                          className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                          style={{
                            background: reviewMode === 'APPROVE'
                              ? 'linear-gradient(135deg, #00C5D4, #009BAB)'
                              : 'linear-gradient(135deg, #F0177A, #C0005A)',
                          }}
                        >
                          {isSaving ? 'Procesando…' : reviewMode === 'APPROVE' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
                        </button>
                        <button
                          onClick={() => { setReviewMode(null); setNote(''); }}
                          className="px-4 py-3 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
                          style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setReviewMode('APPROVE'); }}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                      >
                        ✓ Aprobar pago
                      </button>
                      <button
                        onClick={() => { setReviewMode('REJECT'); }}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
                      >
                        ✗ Rechazar pago
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Proof fullscreen overlay */}
        {proofOpen && payment?.providerData?.screenshotUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D1A]/90 backdrop-blur-sm"
            onClick={() => { setProofOpen(false); }}
          >
            <img
              src={payment.providerData.screenshotUrl}
              alt="Comprobante de pago"
              className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
