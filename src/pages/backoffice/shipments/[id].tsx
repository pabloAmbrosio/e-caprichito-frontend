import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeShipmentDetail } from '@/features/orders/hooks/useBackofficeShipmentDetail';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';
import { SHIPMENT_CHAINS } from '@/features/orders/domain/orderStatusMappings';

/* ── Status display config ── */

const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, { label: string; bg: string; color: string }> = {
  PENDING:          { label: 'Pendiente',          bg: 'rgba(255,214,0,0.12)',   color: '#FFD600' },
  PREPARING:        { label: 'Preparando',         bg: 'rgba(0,197,212,0.12)',   color: '#00C5D4' },
  READY_FOR_PICKUP: { label: 'Listo para recoger', bg: 'rgba(0,197,212,0.18)',   color: '#00C5D4' },
  SHIPPED:          { label: 'Enviado',            bg: 'rgba(255,122,0,0.12)',   color: '#FF7A00' },
  IN_TRANSIT:       { label: 'En tránsito',        bg: 'rgba(255,122,0,0.08)',   color: '#FF7A00' },
  OUT_FOR_DELIVERY: { label: 'En reparto',         bg: 'rgba(0,197,212,0.15)',   color: '#00C5D4' },
  DELIVERED:        { label: 'Entregado',          bg: 'rgba(0,197,100,0.12)',   color: '#00C564' },
  FAILED:           { label: 'Fallido',            bg: 'rgba(240,23,122,0.08)',  color: '#F0177A' },
};

const DELIVERY_TYPE_CONFIG: Record<DeliveryType, { label: string; emoji: string }> = {
  PICKUP:        { label: 'Recoger en tienda', emoji: '🏪' },
  HOME_DELIVERY: { label: 'A domicilio',       emoji: '🏍️' },
  SHIPPING:      { label: 'Paquetería',        emoji: '📦' },
};

/* ── State machine — allowed transitions per delivery type ── */

function getNextStatus(current: ShipmentStatus, type: DeliveryType): ShipmentStatus | null {
  const chain = SHIPMENT_CHAINS[type];
  const idx = chain.indexOf(current);
  if (idx === -1 || idx >= chain.length - 1) return null;
  return chain[idx + 1] ?? null;
}

/* ── Helpers ── */

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtMoney(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

/* ── Section card (reused pattern) ── */

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

/* ── Page ── */

export default function EnvioDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { shipment, isLoading, isSaving, error, fetchShipment, advanceShipment, failShipment, updateShipment } = useBackofficeShipmentDetail();

  // Action state
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);
  const [advanceNote, setAdvanceNote] = useState('');
  const [showFailForm, setShowFailForm] = useState(false);
  const [failNote, setFailNote] = useState('');

  // Edit fields state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editCarrier, setEditCarrier] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editEstimated, setEditEstimated] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !id || typeof id !== 'string') return;
    void fetchShipment(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  const nextStatus = shipment ? getNextStatus(shipment.status, shipment.type) : null;
  const nextCfg = nextStatus ? SHIPMENT_STATUS_CONFIG[nextStatus] : null;
  const canAct = shipment && shipment.status !== 'DELIVERED' && shipment.status !== 'FAILED';

  const handleAdvance = async () => {
    if (!shipment) return;
    try {
      await advanceShipment(shipment.id, advanceNote.trim() || undefined);
      setShowAdvanceConfirm(false);
      setAdvanceNote('');
    } catch {
      // error shown in state
    }
  };

  const handleFail = async () => {
    if (!shipment || !failNote.trim()) return;
    try {
      await failShipment(shipment.id, failNote.trim());
      setShowFailForm(false);
      setFailNote('');
    } catch {
      // error shown in state
    }
  };

  const openEditForm = () => {
    if (!shipment) return;
    setEditCarrier(shipment.carrier ?? '');
    setEditTracking(shipment.trackingCode ?? '');
    setEditEstimated(shipment.estimatedAt ? shipment.estimatedAt.slice(0, 16) : '');
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!shipment) return;
    const payload: Record<string, string> = {};
    const trimCarrier = editCarrier.trim();
    const trimTracking = editTracking.trim();
    if (trimCarrier && trimCarrier !== (shipment.carrier ?? '')) payload.carrier = trimCarrier;
    if (trimTracking && trimTracking !== (shipment.trackingCode ?? '')) payload.trackingCode = trimTracking;
    if (editEstimated && editEstimated !== (shipment.estimatedAt ?? '').slice(0, 16)) payload.estimatedAt = new Date(editEstimated).toISOString();
    if (Object.keys(payload).length === 0) { setShowEditForm(false); return; }
    try {
      await updateShipment(shipment.id, payload);
      setShowEditForm(false);
    } catch {
      // error shown in state
    }
  };

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title={shipment ? `Envío ${shipment.id.slice(0, 8)}…` : 'Detalle de Envío'}
        breadcrumbs={[
          { label: 'Envíos', href: '/backoffice/shipments' },
          { label: shipment?.id.slice(0, 8) ?? '…' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-3xl flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error && !shipment ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        ) : shipment ? (
          <div className="max-w-3xl flex flex-col gap-5">

            {/* Action error */}
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
                    ID de envío
                  </p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--on-surface)' }}>{shipment.id}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>{fmt(shipment.createdAt)}</p>
                </div>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: SHIPMENT_STATUS_CONFIG[shipment.status].bg, color: SHIPMENT_STATUS_CONFIG[shipment.status].color }}>
                  {SHIPMENT_STATUS_CONFIG[shipment.status].label}
                </span>
              </div>
            </div>

            {/* Información del envío */}
            <SectionCard number="1" title="Información">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Tipo', value: `${DELIVERY_TYPE_CONFIG[shipment.type].emoji} ${DELIVERY_TYPE_CONFIG[shipment.type].label}` },
                  { label: 'Fee de envío', value: fmtMoney(shipment.deliveryFee) },
                  ...(shipment.carrier ? [{ label: 'Paquetería', value: shipment.carrier }] : []),
                  ...(shipment.trackingCode ? [{ label: 'Guía', value: shipment.trackingCode }] : []),
                  { label: 'Estimado', value: shipment.estimatedAt ? fmt(shipment.estimatedAt) : '—' },
                  { label: 'Entregado', value: shipment.deliveredAt ? fmt(shipment.deliveredAt) : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>{label}</p>
                    <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{value}</p>
                  </div>
                ))}

                {/* Dirección con link a Google Maps */}
                <div className="col-span-2 mt-1">
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Dirección</p>
                  {shipment.address ? (
                    <div className="flex items-start gap-2">
                      <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                        {shipment.address.formattedAddress}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${shipment.address.lat},${shipment.address.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 hover:scale-[1.03]"
                        style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}
                        title="Ver en Google Maps"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Ver mapa
                      </a>
                    </div>
                  ) : (
                    <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>—</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Datos editables (carrier, guía, estimado) */}
            {canAct && (
              <SectionCard number="2" title="Datos de envío">
                {showEditForm ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide mb-1 block" style={{ color: 'var(--on-surface-muted)' }}>
                          Paquetería
                        </label>
                        <input
                          type="text"
                          value={editCarrier}
                          onChange={(e) => setEditCarrier(e.target.value)}
                          placeholder="FedEx, Estafeta, DHL…"
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide mb-1 block" style={{ color: 'var(--on-surface-muted)' }}>
                          Número de guía
                        </label>
                        <input
                          type="text"
                          value={editTracking}
                          onChange={(e) => setEditTracking(e.target.value)}
                          placeholder="Tracking code…"
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide mb-1 block" style={{ color: 'var(--on-surface-muted)' }}>
                        Fecha estimada de entrega
                      </label>
                      <input
                        type="datetime-local"
                        value={editEstimated}
                        onChange={(e) => setEditEstimated(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { void handleUpdate(); }}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                      >
                        {isSaving ? 'Guardando…' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => setShowEditForm(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
                        style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 gap-3 text-sm flex-1">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Paquetería</p>
                        <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{shipment.carrier ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Guía</p>
                        <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{shipment.trackingCode ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Estimado</p>
                        <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{shipment.estimatedAt ? fmt(shipment.estimatedAt) : '—'}</p>
                      </div>
                    </div>
                    <button
                      onClick={openEditForm}
                      className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40 hover:text-turquoise"
                      style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Orden vinculada */}
            <SectionCard number="3" title="Orden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>ID de orden</p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--on-surface)' }}>{shipment.order.id}</p>
                </div>
                <Link
                  href={`/backoffice/orders/${shipment.order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold transition-colors duration-150 hover:text-turquoise"
                  style={{ color: 'var(--on-surface-muted)' }}
                >
                  Ver orden
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Cliente</p>
                  <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{shipment.order.customer.username}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Teléfono</p>
                  <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{shipment.order.customer.phone ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--on-surface-muted)' }}>Email</p>
                  <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>{shipment.order.customer.email ?? '—'}</p>
                </div>
              </div>
            </SectionCard>

            {/* Progress visual */}
            <SectionCard number="4" title="Progreso">
              {shipment.status === 'FAILED' ? (
                <div className="flex items-center gap-3 p-4 rounded-xl border"
                  style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)' }}>
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl text-lg"
                    style={{ background: 'rgba(240,23,122,0.1)' }}>
                    ❌
                  </span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#F0177A' }}>Envío fallido</p>
                    {shipment.events.length > 0 && shipment.events[shipment.events.length - 1]?.status === 'FAILED' && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--on-surface-muted)' }}>
                        {shipment.events[shipment.events.length - 1]?.note}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-0" role="list">
                  {SHIPMENT_CHAINS[shipment.type].map((step, idx, arr) => {
                    const currentIdx = arr.indexOf(shipment.status);
                    const isCompleted = idx <= currentIdx;
                    const isActive = idx === currentIdx;
                    const stepCfg = SHIPMENT_STATUS_CONFIG[step];
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative" role="listitem">
                        {/* Connector line */}
                        {idx < arr.length - 1 && (
                          <div
                            className="absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-500"
                            style={{ background: isCompleted ? '#00C5D4' : 'var(--stroke)' }}
                            aria-hidden="true"
                          />
                        )}
                        {/* Circle */}
                        <div
                          className={[
                            'relative z-10 flex items-center justify-center w-9 h-9 rounded-full text-sm border-2 transition-all duration-300',
                            isCompleted ? 'border-turquoise text-white' : 'border-stroke text-on-surface-muted',
                            isActive ? 'ring-4 ring-turquoise/20 scale-110' : '',
                          ].join(' ')}
                          style={isCompleted ? { background: 'linear-gradient(135deg, #00C5D4, #009BAB)' } : { background: 'var(--surface)' }}
                        >
                          {isCompleted ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>
                        {/* Label */}
                        <p className={[
                          'mt-2 text-[0.65rem] font-bold text-center leading-tight',
                          isActive ? 'text-turquoise' : isCompleted ? '' : '',
                        ].join(' ')}
                          style={{ color: isActive ? '#00C5D4' : isCompleted ? 'var(--on-surface)' : 'var(--on-surface-muted)' }}>
                          {stepCfg.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Timeline de eventos */}
            {shipment.events.length > 0 && (
              <SectionCard number="5" title="Timeline">
                <div className="relative pl-4">
                  <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: 'var(--stroke)' }} aria-hidden="true" />
                  <div className="flex flex-col gap-3">
                    {shipment.events.map((event) => {
                      const evCfg = SHIPMENT_STATUS_CONFIG[event.status];
                      return (
                        <div key={event.id} className="relative flex flex-col gap-0.5">
                          <div
                            className="absolute -left-[1.125rem] top-1 w-2.5 h-2.5 rounded-full border-2"
                            style={{
                              background: event.status === 'FAILED' ? '#F0177A' : '#00C5D4',
                              borderColor: 'var(--surface)',
                            }}
                            aria-hidden="true"
                          />
                          <span className="text-sm font-bold" style={{ color: evCfg.color }}>
                            {evCfg.label}
                          </span>
                          {event.note && (
                            <span className="text-xs italic" style={{ color: 'var(--on-surface-muted)' }}>
                              &quot;{event.note}&quot;
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--on-surface-muted)', opacity: 0.6 }}>
                            {event.staff ? `por ${event.staff.username} · ` : ''}{fmt(event.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Acciones */}
            {canAct && (
              <SectionCard number="6" title="Acciones">
                <div className="flex flex-col gap-4">

                  {/* Avanzar estado */}
                  {nextStatus && nextCfg && (
                    <div>
                      {showAdvanceConfirm ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
                            ¿Avanzar a <strong style={{ color: nextCfg.color }}>{nextCfg.label}</strong>?
                          </p>
                          <textarea
                            value={advanceNote}
                            onChange={(e) => setAdvanceNote(e.target.value)}
                            placeholder="Nota opcional…"
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all resize-none"
                            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => { void handleAdvance(); }}
                              disabled={isSaving}
                              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                            >
                              {isSaving ? 'Guardando…' : `Avanzar a ${nextCfg.label}`}
                            </button>
                            <button
                              onClick={() => { setShowAdvanceConfirm(false); setAdvanceNote(''); }}
                              className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
                              style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setShowAdvanceConfirm(true); setShowFailForm(false); }}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                        >
                          Avanzar a: {nextCfg.label}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Separador */}
                  {nextStatus && (
                    <div className="border-t" style={{ borderColor: 'var(--stroke)' }} />
                  )}

                  {/* Reportar fallo */}
                  <div>
                    {showFailForm ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm font-semibold" style={{ color: '#F0177A' }}>
                          Reportar fallo en el envío
                        </p>
                        <textarea
                          value={failNote}
                          onChange={(e) => setFailNote(e.target.value)}
                          placeholder="Motivo del fallo (obligatorio)…"
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-pink/40 transition-all resize-none"
                          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => { void handleFail(); }}
                            disabled={isSaving || !failNote.trim()}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
                          >
                            {isSaving ? 'Guardando…' : 'Confirmar fallo'}
                          </button>
                          <button
                            onClick={() => { setShowFailForm(false); setFailNote(''); }}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
                            style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setShowFailForm(true); setShowAdvanceConfirm(false); }}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:border-pink/40 hover:text-pink"
                        style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
                      >
                        Reportar fallo
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        ) : null}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
