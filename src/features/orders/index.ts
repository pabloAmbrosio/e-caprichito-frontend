export type {
  OrderItemProduct,
  OrderItem,
  OrderPaymentSummary,
  Shipment,
  ShipmentEvent,
  ShipmentSummary,
  ShipmentAddress,
  AddressSnapshot,
  MyOrder,
  CreateOrderResult,
  CreateOrderPayload,
  PaymentInfo,
  PaymentInfoLastPayment,
  PaymentInfoBankDetails,
  CalculateFeeResult,
  CancelOrderResult,
  BackofficeOrderCustomer,
  BackofficeOrderItem,
  BackofficeOrderPayment,
  BackofficeOrderShipment,
  BackofficeOrderListItem,
  BackofficeOrderDetail,
} from './domain/types';

export type { OrderRepository } from './domain/OrderRepository';

export { createOrderApi } from './infrastructure/orderApi';

export {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR_CLASS,
  ORDER_STATUS_ICON,
  DELIVERY_TYPE_LABEL,
  DELIVERY_TYPE_COLOR_CLASS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  SHIPMENT_STEPS,
  SHIPMENT_STEP_ORDER,
  SHIPMENT_CHAINS,
} from './domain/orderStatusMappings';

export { useMyOrders } from './hooks/useMyOrders';
export { useOrderDetail } from './hooks/useOrderDetail';
export { useShipmentUpdated } from './hooks/useShipmentUpdated';
export { useOrderCancelled } from './hooks/useOrderCancelled';
export { usePaymentInfo } from './hooks/usePaymentInfo';

export { CheckoutPage } from './components/Checkout';
export { PaymentPage } from './components/PaymentPage';
export { OrderItem as OrderItemCard } from './components/MyOrders/OrderItem';
export { OrdersPagination } from './components/MyOrders/OrdersPagination';
export { OrdersEmptyState } from './components/MyOrders/OrdersEmptyState';
export { BackofficeOrdersFilters } from './components/BackofficeOrdersFilters';
export { BackofficeOrdersTable } from './components/BackofficeOrdersTable';
export { BackofficeShipmentsFilters, BackofficeShipmentsTable } from './components/BackofficeShipment';
