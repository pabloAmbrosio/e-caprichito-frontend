import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';

export interface ShipmentEventStaff {
  id: string;
  username: string;
}

export interface ShipmentEvent {
  id: string;
  status: ShipmentStatus;
  note: string;
  staff: ShipmentEventStaff | null;
  createdAt: string;
}

export interface ShipmentAddress {
  label: string;
  formattedAddress: string;
}

export interface Shipment {
  id: string;
  status: ShipmentStatus;
  type: DeliveryType;
  deliveryFee: number;
  carrier: string | null;
  trackingCode: string | null;
  estimatedAt: string | null;
  deliveredAt: string | null;
  address: ShipmentAddress | null;
  events: ShipmentEvent[];
}

/** Minimal shipment info returned by createOrder */
export interface ShipmentSummary {
  id: string;
  type: DeliveryType;
  status: ShipmentStatus;
}
