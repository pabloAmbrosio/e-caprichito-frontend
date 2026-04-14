import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';
import type { ShipmentEvent } from './Shipment';

export interface BackofficeShipmentCustomer {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
}

export interface BackofficeShipmentOrder {
  id: string;
  status: string;
  createdAt: string;
  customer: BackofficeShipmentCustomer;
}

export interface BackofficeShipmentAddress {
  id: string;
  label: string;
  formattedAddress: string;
  details: string | null;
  lat: number;
  lng: number;
}

export interface BackofficeShipmentListItem {
  id: string;
  status: ShipmentStatus;
  type: DeliveryType;
  deliveryFee: number;
  carrier: string | null;
  trackingCode: string | null;
  estimatedAt: string | null;
  deliveredAt: string | null;
  address: BackofficeShipmentAddress | null;
  createdAt: string;
  updatedAt: string;
  order: BackofficeShipmentOrder;
}

export interface BackofficeShipmentDetail extends BackofficeShipmentListItem {
  events: ShipmentEvent[];
}
