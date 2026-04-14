import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeShipments } from '@/features/orders/hooks/useBackofficeShipments';
import { BackofficeShipmentsFilters, BackofficeShipmentsTable } from '@/features/orders';
import { BackofficePagination } from '@/shared/components/BackofficePagination';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createShipmentApi } from '@/features/orders/infrastructure/shipmentApi';
import { SHIPMENT_CHAINS, SHIPMENT_STEPS, DELIVERY_TYPE_LABEL } from '@/features/orders/domain/orderStatusMappings';
import type { BackofficeShipmentListItem } from '@/features/orders/domain/types';
import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';

const LIMIT = 20;
const activeApi = createShipmentApi();

const ACTIVE_STATUSES: ShipmentStatus[] = ['PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'];
const SWIPE_THRESHOLD = 100; // px to trigger advance

function getNextStatus(shipment: BackofficeShipmentListItem): { label: string; emoji: string } | null {
  const chain = SHIPMENT_CHAINS[shipment.type];
  const idx = chain.indexOf(shipment.status);
  if (idx < 0 || idx >= chain.length - 1) return null;
  const next = chain[idx + 1]!;
  const step = SHIPMENT_STEPS.find((s) => s.status === next);
  return step ? { label: step.label, emoji: step.emoji } : null;
}

const STATUS_CARD_COLORS: Partial<Record<ShipmentStatus, { border: string; accent: string }>> = {
  PENDING:            { border: 'rgba(255,214,0,0.35)',  accent: '#FFD600' },
  PREPARING:          { border: 'rgba(255,122,0,0.35)',  accent: '#FF7A00' },
  READY_FOR_PICKUP:   { border: 'rgba(0,197,212,0.35)', accent: '#00C5D4' },
  SHIPPED:            { border: 'rgba(0,197,212,0.35)', accent: '#00C5D4' },
  IN_TRANSIT:         { border: 'rgba(0,197,212,0.35)', accent: '#00C5D4' },
  OUT_FOR_DELIVERY:   { border: 'rgba(0,197,212,0.35)', accent: '#00C5D4' },
};

/* ─── Swipeable shipment card ─── */
function SwipeableShipmentCard({
  shipment,
  pendingConfirmId,
  onSwipeTriggered,
}: {
  shipment: BackofficeShipmentListItem;
  pendingConfirmId: string | null;
  onSwipeTriggered: (shipment: BackofficeShipmentListItem) => void;
}) {
  const router = useRouter();
  const colors = STATUS_CARD_COLORS[shipment.status] ?? { border: 'var(--stroke)', accent: '#00C5D4' };
  const next = getNextStatus(shipment);
  const stepInfo = SHIPMENT_STEPS.find((st) => st.status === shipment.status);

  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);

  const isPending = pendingConfirmId === shipment.id;
  const triggered = offsetX <= -SWIPE_THRESHOLD;
  const progress = Math.min(Math.abs(offsetX) / SWIPE_THRESHOLD, 1);

  // Snap back when modal is dismissed (pendingConfirmId cleared)
  useEffect(() => {
    if (!isPending && offsetX !== 0 && !isDragging) {
      setOffsetX(0);
    }
  }, [isPending, offsetX, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    didDragRef.current = false;
    if (isPending || !next) return;
    draggingRef.current = true;
    setIsDragging(true);
    setErrorMsg('');
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) didDragRef.current = true;
    setOffsetX(Math.min(0, dx));
  };

  const handlePointerUp = () => {
    // Tap (no drag or tiny drag) → navigate to detail
    if (!didDragRef.current) {
      draggingRef.current = false;
      setIsDragging(false);
      void router.push(`/backoffice/shipments/${shipment.id}`);
      return;
    }

    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    if (triggered) {
      setOffsetX(-SWIPE_THRESHOLD);
      onSwipeTriggered(shipment);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden select-none" style={{ touchAction: 'pan-y' }}>
      {/* Revealed layer underneath */}
      <div
        className="absolute inset-0 rounded-xl flex items-center justify-end px-5 gap-2 transition-colors duration-150"
        style={{
          background: triggered ? `${colors.accent}25` : 'rgba(0,197,212,0.06)',
        }}
      >
        {next && (
          <span
            className="flex items-center gap-2 text-sm font-bold transition-all duration-150"
            style={{
              color: colors.accent,
              opacity: 0.4 + progress * 0.6,
              transform: `scale(${0.9 + progress * 0.1})`,
            }}
          >
            <span className="text-lg">{next.emoji}</span>
            {next.label}
            {triggered && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        )}

        {/* Progress bar */}
        {next && progress > 0 && (
          <div className="absolute bottom-0 left-0 h-[3px] transition-all duration-75"
            style={{
              width: `${progress * 100}%`,
              background: triggered
                ? `linear-gradient(90deg, ${colors.accent}, #4CAF50)`
                : colors.accent,
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* Foreground card — draggable */}
      <div
        className="relative flex flex-col gap-2 p-4 rounded-xl border cursor-pointer active:cursor-grabbing"
        style={{
          background: 'var(--surface)',
          borderColor: isDragging ? colors.accent : colors.border,
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.15s',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Gradient accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: `linear-gradient(90deg, ${colors.accent}, #00C5D4)` }} />

        {/* Status + emoji + link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{stepInfo?.emoji ?? '📦'}</span>
            <span className="text-sm font-extrabold" style={{ color: colors.accent }}>
              {stepInfo?.label ?? shipment.status}
            </span>
          </div>
          <svg className="w-4 h-4" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full text-[0.625rem] font-extrabold text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, #009BAB)` }}>
            {shipment.order.customer.username.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
            {shipment.order.customer.username}
          </span>
        </div>

        {/* Type + swipe hint */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--on-surface-muted)' }}>
            {DELIVERY_TYPE_LABEL[shipment.type]}
          </span>
          {next && !isDragging && !isPending && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] font-semibold" style={{ color: 'var(--on-surface-muted)', opacity: 0.5 }}>
              ← desliza
            </span>
          )}
          {next && isDragging && (
            <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${colors.accent}15`, color: colors.accent }}>
              → {next.emoji} {next.label}
            </span>
          )}
        </div>

        {/* Error inline */}
        {errorMsg && (
          <div className="text-[0.65rem] font-semibold px-2 py-1 rounded-lg mt-1"
            style={{ background: 'rgba(240,23,122,0.08)', color: '#F0177A' }}>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EnviosPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { shipments, pagination, isLoading, error, fetchShipments } = useBackofficeShipments();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<DeliveryType | ''>('');
  const [activeShipments, setActiveShipments] = useState<BackofficeShipmentListItem[]>([]);

  // Modal confirmation state
  const [confirmTarget, setConfirmTarget] = useState<BackofficeShipmentListItem | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState('');
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const load = useCallback((p: number, s: typeof statusFilter, t: typeof typeFilter) => {
    void fetchShipments({
      page: p,
      limit: LIMIT,
      ...(s && { status: s }),
      ...(t && { type: t }),
    });
  }, [fetchShipments]);

  const loadActive = useCallback(async () => {
    try {
      const res = await activeApi.backofficeList({ limit: 100 });
      const active = res.items.filter((s) => ACTIVE_STATUSES.includes(s.status));
      active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActiveShipments(active);
    } catch { /* silent */ }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) { load(page, statusFilter, typeFilter); void loadActive(); } }, [isAuthenticated]);

  // Focus confirm button when modal opens
  useEffect(() => {
    if (confirmTarget) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    }
  }, [confirmTarget]);

  // Escape to close modal
  useEffect(() => {
    if (!confirmTarget) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setConfirmTarget(null); setAdvanceError(''); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmTarget]);

  const handleSwipeTriggered = useCallback((s: BackofficeShipmentListItem) => {
    setConfirmTarget(s);
    setAdvanceError('');
  }, []);

  const handleModalCancel = () => {
    setConfirmTarget(null);
    setAdvanceError('');
  };

  const handleModalConfirm = async () => {
    if (!confirmTarget) return;
    setIsAdvancing(true);
    setAdvanceError('');
    try {
      const result = await activeApi.backofficeAdvance(confirmTarget.id);
      const newStatus = result.status;
      // Update local state
      if (ACTIVE_STATUSES.includes(newStatus)) {
        setActiveShipments((prev) =>
          prev.map((s) => (s.id === confirmTarget.id ? { ...s, status: newStatus } : s))
        );
      } else {
        setActiveShipments((prev) => prev.filter((s) => s.id !== confirmTarget.id));
      }
      load(page, statusFilter, typeFilter);
      setConfirmTarget(null);
    } catch (err) {
      setAdvanceError(err instanceof Error ? err.message : 'Error al avanzar el envío');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleStatusChange = (s: ShipmentStatus | '') => {
    setStatusFilter(s);
    setPage(1);
    load(1, s, typeFilter);
  };

  const handleTypeChange = (t: DeliveryType | '') => {
    setTypeFilter(t);
    setPage(1);
    load(1, statusFilter, t);
  };

  const handlePage = (p: number) => {
    setPage(p);
    load(p, statusFilter, typeFilter);
  };

  const totalPages = pagination ? pagination.totalPages : 1;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Envíos"
        breadcrumbs={[{ label: 'Envíos' }]}
      >
        {/* Envíos activos — acceso rápido */}
        {activeShipments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#00C5D4' }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#00C5D4' }} />
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: '#00C5D4' }}>
                {activeShipments.length} envío{activeShipments.length > 1 ? 's' : ''} en proceso
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {activeShipments.map((s) => (
                <SwipeableShipmentCard
                  key={s.id}
                  shipment={s}
                  pendingConfirmId={confirmTarget?.id ?? null}
                  onSwipeTriggered={handleSwipeTriggered}
                />
              ))}
            </div>
          </div>
        )}

        <BackofficeShipmentsFilters
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusChange={handleStatusChange}
          onTypeChange={handleTypeChange}
        />

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold mb-6 max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <BackofficeShipmentsTable isLoading={isLoading} shipments={shipments} />

        {!isLoading && (
          <BackofficePagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePage}
          />
        )}
      </BackofficeLayout>

      {/* ─── Fullscreen confirmation modal ─── */}
      {confirmTarget && (() => {
        const tColors = STATUS_CARD_COLORS[confirmTarget.status] ?? { border: 'var(--stroke)', accent: '#00C5D4' };
        const tNext = getNextStatus(confirmTarget);
        const tStep = SHIPMENT_STEPS.find((st) => st.status === confirmTarget.status);
        if (!tNext) return null;
        return (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-[80] transition-opacity duration-200"
              style={{ background: 'rgba(13,13,26,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={handleModalCancel}
            />

            {/* Modal */}
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Confirmar avance de envío"
            >
              <div
                className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg"
                style={{ background: 'var(--surface)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient stripe */}
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${tColors.accent}, #00C5D4)` }} />

                <div className="flex flex-col items-center gap-4 p-6 pt-5">
                  {/* Current → Next */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{tStep?.emoji ?? '📦'}</span>
                      <span className="text-[0.65rem] font-bold" style={{ color: 'var(--on-surface-muted)' }}>
                        {tStep?.label ?? confirmTarget.status}
                      </span>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tColors.accent} strokeWidth="2.5" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="14 7 19 12 14 17" />
                    </svg>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{tNext.emoji}</span>
                      <span className="text-[0.65rem] font-extrabold" style={{ color: tColors.accent }}>
                        {tNext.label}
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-bold text-center" style={{ color: 'var(--on-surface)' }}>
                    ¿Avanzar este envío a <span style={{ color: tColors.accent }}>{tNext.label}</span>?
                  </p>

                  {/* Shipment info */}
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface-raised)' }}
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${tColors.accent}, #009BAB)` }}
                    >
                      {confirmTarget.order.customer.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
                        {confirmTarget.order.customer.username}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                        {DELIVERY_TYPE_LABEL[confirmTarget.type]} — Orden {confirmTarget.order.id.slice(0, 8)}…
                      </span>
                    </div>
                  </div>

                  {/* Error */}
                  {advanceError && (
                    <div
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold"
                      style={{ background: 'rgba(240,23,122,0.06)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {advanceError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 w-full mt-1">
                    <button
                      onClick={handleModalCancel}
                      disabled={isAdvancing}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-150 hover:border-[rgba(0,197,212,0.3)] disabled:opacity-50"
                      style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)', background: 'transparent' }}
                    >
                      Cancelar
                    </button>
                    <button
                      ref={confirmBtnRef}
                      onClick={() => void handleModalConfirm()}
                      disabled={isAdvancing}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,197,212,0.35)] disabled:opacity-70 disabled:hover:scale-100"
                      style={{ background: `linear-gradient(135deg, ${tColors.accent}, #009BAB)` }}
                    >
                      {isAdvancing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" strokeDasharray="56" strokeDashoffset="14" />
                          </svg>
                          Avanzando…
                        </span>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </ProtectedBackofficeRoute>
  );
}
