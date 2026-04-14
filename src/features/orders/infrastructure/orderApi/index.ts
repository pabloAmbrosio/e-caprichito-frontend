import type { OrderRepository } from '../../domain/OrderRepository';
import { createOrder } from './createOrder';
import { listOrders } from './listOrders';
import { cancelOrder } from './cancelOrder';
import { getOrderDetail } from './getOrderDetail';
import { getPaymentInfo } from './getPaymentInfo';
import { calculateDeliveryFee } from './calculateDeliveryFee';
import { getTracking } from './getTracking';
import { backofficeListOrders } from './backofficeListOrders';
import { backofficeGetOrderById } from './backofficeGetOrderById';
import { backofficeCancelOrder } from './backofficeCancelOrder';

export function createOrderApi(): OrderRepository {
  return {
    create: createOrder,
    list: listOrders,
    cancel: cancelOrder,
    getById: getOrderDetail,
    getPaymentInfo,
    calculateDeliveryFee,
    getTracking,
    backofficeList: backofficeListOrders,
    backofficeGetById: backofficeGetOrderById,
    backofficeCancelOrder,
  };
}
