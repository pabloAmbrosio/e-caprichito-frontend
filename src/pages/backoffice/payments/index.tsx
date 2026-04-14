import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficePayments } from '@/features/payments/hooks/useBackofficePayments';
import { useOnPaymentProof } from '@/features/payments/hooks/useOnPaymentProof';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createPaymentApi } from '@/features/payments/infrastructure/paymentApi';
import type { BackofficePayment } from '@/features/payments/domain/types/BackofficePayment';
import type { PaymentStatus } from '@/shared/types/enums';

const LIMIT = 20;
const pendingApi = createPaymentApi();
const SWIPE_THRESHOLD = 100;

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
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}
function fmtMoney(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

const ALL_PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'AWAITING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'REFUNDED', 'CANCELLED'];
const HEADERS = ['Fecha', 'Cliente', 'Orden', 'Monto', 'Método', 'Estado', ''];

/* ─── Swipeable payment card ─── */
function SwipeablePaymentCard({
  payment,
  pendingConfirmId,
  onSwipeTriggered,
}: {
  payment: BackofficePayment;
  pendingConfirmId: string | null;
  onSwipeTriggered: (payment: BackofficePayment) => void;
}) {
  const router = useRouter();

  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);

  const isPending = pendingConfirmId === payment.id;
  const triggered = offsetX <= -SWIPE_THRESHOLD;
  const progress = Math.min(Math.abs(offsetX) / SWIPE_THRESHOLD, 1);

  // Snap back when modal is dismissed
  useEffect(() => {
    if (!isPending && offsetX !== 0 && !isDragging) {
      setOffsetX(0);
    }
  }, [isPending, offsetX, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    didDragRef.current = false;
    if (isPending) return;
    draggingRef.current = true;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) didDragRef.current = true;
    setOffsetX(Math.min(0, dx));
  };

  const handlePointerUp = () => {
    if (!didDragRef.current) {
      draggingRef.current = false;
      setIsDragging(false);
      void router.push(`/backoffice/payments/${payment.id}`);
      return;
    }

    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    if (triggered) {
      setOffsetX(-SWIPE_THRESHOLD);
      onSwipeTriggered(payment);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden select-none" style={{ touchAction: 'pan-y' }}>
      {/* Revealed layer underneath */}
      <div
        className="absolute inset-0 rounded-xl flex items-center justify-end px-5 gap-2 transition-colors duration-150"
        style={{ background: triggered ? 'rgba(240,23,122,0.15)' : 'rgba(240,23,122,0.04)' }}
      >
        <span
          className="flex items-center gap-2 text-sm font-bold transition-all duration-150"
          style={{
            color: '#F0177A',
            opacity: 0.4 + progress * 0.6,
            transform: `scale(${0.9 + progress * 0.1})`,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Revisar
          {triggered && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 h-[3px] transition-all duration-75"
            style={{
              width: `${progress * 100}%`,
              background: triggered ? 'linear-gradient(90deg, #F0177A, #FF7A00)' : '#F0177A',
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* Foreground card */}
      <div
        className="relative flex flex-col gap-2 p-4 rounded-xl border cursor-pointer active:cursor-grabbing"
        style={{
          background: 'var(--surface)',
          borderColor: isDragging ? '#F0177A' : 'rgba(240,23,122,0.25)',
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.15s',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Gradient accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: 'linear-gradient(90deg, #F0177A, #FF7A00)' }} />

        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold" style={{ color: '#F0177A' }}>
            {fmtMoney(payment.amount)}
          </span>
          <svg className="w-4 h-4" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full text-[0.625rem] font-extrabold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}>
            {payment.customer.username.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
            {payment.customer.username}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--on-surface-muted)' }}>
            {payment.method === 'CASH_ON_DELIVERY' ? 'Pago al recibir' : 'Transferencia'}
          </span>
          {!isDragging && !isPending && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] font-semibold" style={{ color: 'var(--on-surface-muted)', opacity: 0.5 }}>
              ← desliza
            </span>
          )}
          {isDragging && (
            <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
              {fmt(payment.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagosPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { payments, isLoading, error, fetchPayments } = useBackofficePayments();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [pendingPayments, setPendingPayments] = useState<BackofficePayment[]>([]);

  // Modal state
  const [reviewTarget, setReviewTarget] = useState<BackofficePayment | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [proofFullscreen, setProofFullscreen] = useState(false);

  const pageRef = useRef(page);
  pageRef.current = page;
  const statusRef = useRef(statusFilter);
  statusRef.current = statusFilter;

  const load = useCallback((p: number, s: typeof statusFilter) => {
    void fetchPayments({ page: p, limit: LIMIT, ...(s && { status: s }) });
  }, [fetchPayments]);

  const loadPending = useCallback(async () => {
    try {
      const res = await pendingApi.backofficeList({ status: 'AWAITING_REVIEW', limit: 50 });
      setPendingPayments(res.items);
    } catch { /* silent */ }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) { load(1, ''); void loadPending(); } }, [isAuthenticated]);

  useOnPaymentProof(() => { load(pageRef.current, statusRef.current); void loadPending(); });

  // Escape to close modal
  useEffect(() => {
    if (!reviewTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !proofFullscreen) {
        setReviewTarget(null);
        setReviewAction(null);
        setReviewNote('');
        setReviewError('');
      }
      if (e.key === 'Escape' && proofFullscreen) {
        setProofFullscreen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [reviewTarget, proofFullscreen]);

  const handleStatusChange = (s: PaymentStatus | '') => {
    setStatusFilter(s);
    setPage(1);
    load(1, s);
  };

  const handleSwipeTriggered = useCallback((p: BackofficePayment) => {
    setReviewTarget(p);
    setReviewAction(null);
    setReviewNote('');
    setReviewError('');
  }, []);

  const handleModalClose = () => {
    if (isReviewing) return;
    setReviewTarget(null);
    setReviewAction(null);
    setReviewNote('');
    setReviewError('');
  };

  const handleReviewConfirm = async () => {
    if (!reviewTarget || !reviewAction) return;
    if (reviewAction === 'REJECT' && !reviewNote.trim()) return;
    setIsReviewing(true);
    setReviewError('');
    try {
      await pendingApi.backofficeReview(
        reviewTarget.id,
        reviewAction,
        reviewNote.trim() || undefined,
      );
      // Remove from pending list
      setPendingPayments((prev) => prev.filter((p) => p.id !== reviewTarget.id));
      load(pageRef.current, statusRef.current);
      handleModalClose();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Error al procesar la revisión');
    } finally {
      setIsReviewing(false);
    }
  };

  const proofUrl = reviewTarget?.providerData?.screenshotUrl ?? null;
  const bankRef = reviewTarget?.providerData?.bankReference ?? null;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout title="Pagos" breadcrumbs={[{ label: 'Pagos' }]}>

        {/* Pagos pendientes de revisión — acceso rápido */}
        {pendingPayments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#F0177A' }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#F0177A' }} />
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: '#F0177A' }}>
                {pendingPayments.length} pago{pendingPayments.length > 1 ? 's' : ''} por revisar
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {pendingPayments.map((p) => (
                <SwipeablePaymentCard
                  key={p.id}
                  payment={p}
                  pendingConfirmId={reviewTarget?.id ?? null}
                  onSwipeTriggered={handleSwipeTriggered}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filtro */}
        <div className="flex gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => { handleStatusChange(e.target.value as PaymentStatus | ''); }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
          >
            <option value="">Todos los estados</option>
            {ALL_PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{PAYMENT_STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold mb-6 max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} aria-hidden="true">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>No hay pagos</p>
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
                {payments.map((payment) => {
                  const pCfg = PAYMENT_STATUS_CONFIG[payment.status as keyof typeof PAYMENT_STATUS_CONFIG] ?? PAYMENT_STATUS_CONFIG.PENDING;
                  const isUrgent = payment.status === 'AWAITING_REVIEW';
                  return (
                    <tr key={payment.id}
                      className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
                      style={{ borderColor: 'var(--stroke)', background: isUrgent ? 'rgba(240,23,122,0.025)' : undefined }}
                    >
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--on-surface-muted)' }}>
                        {fmt(payment.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                            {payment.customer.username}
                          </span>
                          {payment.customer.phone && (
                            <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                              {payment.customer.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/backoffice/orders/${payment.orderId}`}
                          className="text-xs font-mono font-bold hover:text-turquoise transition-colors"
                          style={{ color: 'var(--on-surface-muted)' }}>
                          {payment.orderId.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--on-surface)' }}>
                        {fmtMoney(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--on-surface-muted)' }}>
                        {payment.method === 'CASH_ON_DELIVERY' ? 'Pago al recibir' : 'Transferencia'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: pCfg.bg, color: pCfg.color }}>
                          {isUrgent && <span className="animate-pulse">⚡</span>}
                          {pCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/backoffice/payments/${payment.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold transition-colors duration-150 hover:text-turquoise"
                          style={{ color: 'var(--on-surface-muted)' }}>
                          {isUrgent ? 'Revisar' : 'Ver'}
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

        {/* Paginación simple */}
        {!isLoading && payments.length === LIMIT && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => { const next = page + 1; setPage(next); load(next, statusFilter); }}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40"
              style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </BackofficeLayout>

      {/* ─── Fullscreen review modal ─── */}
      {reviewTarget && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[80] transition-opacity duration-200"
            style={{ background: 'rgba(13,13,26,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={handleModalClose}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Revisar pago"
          >
            <div
              className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg max-h-[90vh] overflow-y-auto"
              style={{ background: 'var(--surface)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient stripe */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #F0177A, #FF7A00)' }} />

              <div className="flex flex-col gap-4 p-6 pt-5">
                {/* Header: amount + customer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-extrabold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
                    >
                      {reviewTarget.customer.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
                        {reviewTarget.customer.username}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                        {reviewTarget.method === 'CASH_ON_DELIVERY' ? 'Pago al recibir' : 'Transferencia'} — {fmt(reviewTarget.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xl font-extrabold shrink-0" style={{ color: '#F0177A' }}>
                    {fmtMoney(reviewTarget.amount)}
                  </span>
                </div>

                {/* Bank reference */}
                {bankRef && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--surface-raised)', color: 'var(--on-surface-muted)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Ref: {bankRef}
                  </div>
                )}

                {/* Proof image */}
                {proofUrl ? (
                  <button
                    type="button"
                    onClick={() => setProofFullscreen(true)}
                    className="relative w-full rounded-xl overflow-hidden border transition-all duration-200 hover:border-[rgba(240,23,122,0.4)] hover:shadow-[0_0_0_3px_rgba(240,23,122,0.1)] cursor-zoom-in"
                    style={{ borderColor: 'var(--stroke)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proofUrl}
                      alt="Comprobante de pago"
                      className="w-full max-h-[20rem] object-contain"
                      style={{ background: 'var(--surface-raised)' }}
                    />
                    <span
                      className="absolute bottom-2 right-2 px-2 py-1 rounded-md text-[0.6rem] font-bold"
                      style={{ background: 'rgba(13,13,26,0.7)', color: 'white' }}
                    >
                      Click para ampliar
                    </span>
                  </button>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-8 rounded-xl border"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface-raised)' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.3 }} aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-xs font-medium mt-2" style={{ color: 'var(--on-surface-muted)' }}>Sin comprobante</span>
                  </div>
                )}

                {/* Error */}
                {reviewError && (
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold"
                    style={{ background: 'rgba(240,23,122,0.06)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {reviewError}
                  </div>
                )}

                {/* Action selection or note input */}
                {!reviewAction ? (
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleModalClose}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-150 hover:border-[rgba(0,197,212,0.3)]"
                      style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)', background: 'transparent' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setReviewAction('REJECT')}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-extrabold border transition-all duration-150 hover:scale-[1.02]"
                      style={{ borderColor: 'rgba(240,23,122,0.3)', color: '#F0177A', background: 'rgba(240,23,122,0.06)' }}
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => setReviewAction('APPROVE')}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,197,212,0.35)]"
                      style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                    >
                      Aprobar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Confirmation header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                      style={{
                        background: reviewAction === 'APPROVE' ? 'rgba(0,197,212,0.08)' : 'rgba(240,23,122,0.06)',
                        color: reviewAction === 'APPROVE' ? '#00C5D4' : '#F0177A',
                      }}
                    >
                      {reviewAction === 'APPROVE' ? '✓ Aprobar pago' : '✕ Rechazar pago'} — {fmtMoney(reviewTarget.amount)}
                    </div>

                    {/* Note */}
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder={reviewAction === 'REJECT' ? 'Motivo del rechazo (obligatorio)' : 'Nota opcional'}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-turquoise/40 resize-none"
                      style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setReviewAction(null); setReviewNote(''); }}
                        disabled={isReviewing}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-150 hover:border-[rgba(0,197,212,0.3)] disabled:opacity-50"
                        style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)', background: 'transparent' }}
                      >
                        Volver
                      </button>
                      <button
                        onClick={() => void handleReviewConfirm()}
                        disabled={isReviewing || (reviewAction === 'REJECT' && !reviewNote.trim())}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all duration-150 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                        style={{
                          background: reviewAction === 'APPROVE'
                            ? 'linear-gradient(135deg, #00C5D4, #009BAB)'
                            : 'linear-gradient(135deg, #F0177A, #C0005A)',
                        }}
                      >
                        {isReviewing ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" strokeDasharray="56" strokeDashoffset="14" />
                            </svg>
                            Procesando…
                          </span>
                        ) : (
                          `Confirmar ${reviewAction === 'APPROVE' ? 'aprobación' : 'rechazo'}`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen proof overlay */}
          {proofFullscreen && proofUrl && (
            <>
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
                style={{ background: 'rgba(13,13,26,0.9)' }}
                onClick={() => setProofFullscreen(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proofUrl}
                  alt="Comprobante de pago"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setProofFullscreen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </>
      )}
    </ProtectedBackofficeRoute>
  );
}
