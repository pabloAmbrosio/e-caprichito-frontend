import type { ShipmentSummary } from './Shipment';
import type { PaymentMethod, PaymentStatus } from '@/shared/types/enums';

export interface CreateOrderPayment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber?: string;
  status: 'PENDING' | 'CONFIRMED';
  itemCount: number;
  expiresAt: string | null;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  total: number;
  shipment: ShipmentSummary;
  payment?: CreateOrderPayment;
}
