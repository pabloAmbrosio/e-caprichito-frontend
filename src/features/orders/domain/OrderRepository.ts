import type {
  MyOrder,
  CreateOrderResult,
  CreateOrderPayload,
  CancelOrderResult,
  PaymentInfo,
  CalculateFeeResult,
  Shipment,
  BackofficeOrderListItem,
  BackofficeOrderDetail,
  BackofficeCancelOrderResult,
} from './types';
import type { PaginatedResponse } from '@/shared/types/api';
import type { OrderStatus } from '@/shared/types/enums';

export interface OrderRepository {
  // Shop
  create(payload: CreateOrderPayload): Promise<CreateOrderResult>;
  list(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<MyOrder>>;
  getById(orderId: string): Promise<MyOrder>;
  cancel(orderId: string): Promise<CancelOrderResult>;
  getPaymentInfo(orderId: string): Promise<PaymentInfo>;
  calculateDeliveryFee(addressId: string): Promise<CalculateFeeResult>;
  getTracking(orderId: string): Promise<Shipment>;

  // Backoffice
  backofficeList(params?: {
    page?: number; limit?: number;
    status?: OrderStatus; dateFrom?: string; dateTo?: string;
    customerName?: string; productName?: string;
  }): Promise<PaginatedResponse<BackofficeOrderListItem>>;
  backofficeGetById(orderId: string): Promise<BackofficeOrderDetail>;
  backofficeCancelOrder(
    orderId: string,
    reason?: string,
  ): Promise<BackofficeCancelOrderResult>;
}
