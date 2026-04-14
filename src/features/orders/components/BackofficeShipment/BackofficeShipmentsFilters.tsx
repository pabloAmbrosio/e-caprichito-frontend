import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';

const ALL_SHIPMENT_STATUSES: ShipmentStatus[] = [
  'PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED',
];

const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  READY_FOR_PICKUP: 'Listo para recoger',
  SHIPPED: 'Enviado',
  IN_TRANSIT: 'En tránsito',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  FAILED: 'Fallido',
};

const ALL_DELIVERY_TYPES: DeliveryType[] = ['PICKUP', 'HOME_DELIVERY', 'SHIPPING'];

const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  PICKUP: 'Recoger en tienda',
  HOME_DELIVERY: 'A domicilio',
  SHIPPING: 'Paquetería',
};

interface Props {
  statusFilter: ShipmentStatus | '';
  typeFilter: DeliveryType | '';
  onStatusChange: (status: ShipmentStatus | '') => void;
  onTypeChange: (type: DeliveryType | '') => void;
}

export function BackofficeShipmentsFilters({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as ShipmentStatus | '')}
        className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all cursor-pointer"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
      >
        <option value="">Todos los estados</option>
        {ALL_SHIPMENT_STATUSES.map((s) => (
          <option key={s} value={s}>{SHIPMENT_STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value as DeliveryType | '')}
        className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all cursor-pointer"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
      >
        <option value="">Todos los tipos</option>
        {ALL_DELIVERY_TYPES.map((t) => (
          <option key={t} value={t}>{DELIVERY_TYPE_LABELS[t]}</option>
        ))}
      </select>
    </div>
  );
}
