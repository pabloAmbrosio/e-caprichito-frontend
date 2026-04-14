import type { OrderStatus } from '@/shared/types/enums';

export interface CancelOrderResult {
  orderId: string;
  previousStatus: OrderStatus;
  status: 'CANCELLED';
}
