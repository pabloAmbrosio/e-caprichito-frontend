import type { OrderStatus } from '@/shared/types/enums';

export interface BackofficeCancelOrderResult {
  orderId: string;
  previousStatus: OrderStatus;
  status: 'CANCELLED';
  reason?: string;
  shipmentFailed: boolean;
  paymentCancelled: boolean;
}
