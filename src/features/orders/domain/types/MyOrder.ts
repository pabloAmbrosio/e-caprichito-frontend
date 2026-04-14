import type { OrderStatus } from '@/shared/types/enums';
import type { OrderItem } from './OrderItem';
import type { Shipment } from './Shipment';
import type { OrderPaymentSummary } from './OrderPaymentSummary';
import type { AddressSnapshot } from './AddressSnapshot';

export interface MyOrder {
  id: string;
  status: OrderStatus;
  discountTotalInCents: number | null;
  createdAt: string;
  expiresAt: string | null;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  total: number;
  addressSnapshot: AddressSnapshot | null;
  items: OrderItem[];
  shipment: Shipment | null;
  payments: OrderPaymentSummary[];
}
