import Link from 'next/link';
import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';
import type { BackofficeShipmentListItem } from '../../domain/types';
import { SHIPMENT_CHAINS } from '../../domain/orderStatusMappings';

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
  PICKUP:        { label: 'Tienda',     emoji: '🏪' },
  HOME_DELIVERY: { label: 'Domicilio',  emoji: '🏍️' },
  SHIPPING:      { label: 'Paquetería', emoji: '📦' },
};

function getNextStatusLabel(status: ShipmentStatus, type: DeliveryType): string | null {
  const chain = SHIPMENT_CHAINS[type];
  const idx = chain.indexOf(status);
  if (idx === -1 || idx >= chain.length - 1) return null;
  const next = chain[idx + 1];
  return SHIPMENT_STATUS_CONFIG[next]?.label ?? next;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

const HEADERS = ['Orden', 'Cliente', 'Tipo', 'Estado', 'Siguiente', 'Fecha', ''];

interface Props {
  isLoading: boolean;
  shipments: BackofficeShipmentListItem[];
}

export function BackofficeShipmentsTable({ isLoading, shipments }: Props) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
      {isLoading ? (
        <div className="flex flex-col gap-3 p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} aria-hidden="true">
            <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>No hay envíos</p>
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
            {shipments.map((shipment) => {
              const sCfg = SHIPMENT_STATUS_CONFIG[shipment.status];
              const tCfg = DELIVERY_TYPE_CONFIG[shipment.type];
              const nextLabel = getNextStatusLabel(shipment.status, shipment.type);
              return (
                <tr
                  key={shipment.id}
                  className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
                  style={{ borderColor: 'var(--stroke)' }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                      {shipment.order.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                        {shipment.order.customer.username}
                      </span>
                      {shipment.order.customer.phone && (
                        <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                          {shipment.order.customer.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm" title={tCfg.label}>
                      {tCfg.emoji} <span className="text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>{tCfg.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: sCfg.bg, color: sCfg.color }}>
                      {sCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {nextLabel ? (
                      <span className="text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                        → {nextLabel}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }}>
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--on-surface-muted)' }}>
                    {fmt(shipment.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/backoffice/shipments/${shipment.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold transition-colors duration-150 hover:text-turquoise"
                      style={{ color: 'var(--on-surface-muted)' }}
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
