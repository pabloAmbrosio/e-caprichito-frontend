import type {
  OrderStatus,
  ShipmentStatus,
  DeliveryType,
  PaymentStatus,
  PaymentMethod,
  CustomerRole,
} from '@/shared/types/enums';
import type { ShipmentEvent } from './Shipment';
import type { AddressSnapshot } from './AddressSnapshot';

export interface BackofficeOrderCustomer {
  id: string;
  username: string;
  email: string | null;
  phone?: string | null;
  customerRole: CustomerRole | null;
}

export interface BackofficeOrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    sku: string;
    priceInCents: number;
    compareAtPriceInCents?: number | null;
    images: unknown;
    abstractProduct?: {
      id: string;
      title: string;
      category: { id: string; name: string };
      tags: string[];
    };
  };
}

export interface BackofficeOrderPayment {
  id: string;
  status: PaymentStatus;
  amount: number;
  method: PaymentMethod;
  currency?: string;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  reviewer?: { id: string; username: string } | null;
  createdAt: string;
}

export interface BackofficeOrderShipment {
  id: string;
  status: ShipmentStatus;
  type: DeliveryType;
  deliveryFee: number;
  carrier: string | null;
  trackingCode: string | null;
  estimatedAt: string | null;
  deliveredAt: string | null;
  address: { label: string; formattedAddress: string } | null;
  events: ShipmentEvent[];
}

export interface BackofficeOrderListItem {
  id: string;
  status: OrderStatus;
  discountTotalInCents: number | null;
  expiresAt: string | null;
  createdAt: string;
  customer: BackofficeOrderCustomer;
  items: BackofficeOrderItem[];
  payments: BackofficeOrderPayment[];
  shipment: BackofficeOrderShipment | null;
  addressSnapshot: AddressSnapshot | null;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  total: number;
  _count: { items: number };
}

export interface BackofficeOrderDetail extends BackofficeOrderListItem {
  updatedAt: string;
  promotionUsages: Array<{
    id: string;
    discountAmountInCents: number;
    usedAt: string;
    promotion: { id: string; name: string; couponCode: string | null };
  }>;
  statusAuditLogs: Array<{
    id: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    changedAt: string;
    changedByUser: { id: string; username: string };
  }>;
}
