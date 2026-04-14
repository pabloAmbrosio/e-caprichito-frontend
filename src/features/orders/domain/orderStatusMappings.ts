import type { OrderStatus, DeliveryType, PaymentStatus, ShipmentStatus } from '@/shared/types/enums';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const ORDER_STATUS_COLOR_CLASS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow/15 text-yellow-700 dark:text-yellow',
  CONFIRMED: 'bg-turquoise/10 text-turquoise',
  SHIPPED: 'bg-orange/10 text-orange',
  DELIVERED: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-surface-overlay text-on-surface-muted',
};

export const ORDER_STATUS_ICON: Record<OrderStatus, string> = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  SHIPPED: '🚚',
  DELIVERED: '📬',
  CANCELLED: '✕',
};

export const DELIVERY_TYPE_LABEL: Record<DeliveryType, string> = {
  PICKUP: 'Tienda',
  HOME_DELIVERY: 'Domicilio',
  SHIPPING: 'Paqueteria',
};

export const DELIVERY_TYPE_COLOR_CLASS: Record<DeliveryType, string> = {
  PICKUP: 'bg-surface-overlay text-on-surface-muted',
  HOME_DELIVERY: 'bg-turquoise/10 text-turquoise',
  SHIPPING: 'bg-orange/10 text-orange',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  AWAITING_REVIEW: 'En revision',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  PENDING: 'text-yellow-700 dark:text-yellow',
  AWAITING_REVIEW: 'text-orange',
  APPROVED: 'text-green-600 dark:text-green-400',
  REJECTED: 'text-pink',
  REFUNDED: 'text-on-surface-muted',
  EXPIRED: 'text-on-surface-muted',
  CANCELLED: 'text-on-surface-muted',
};

export const SHIPMENT_STEPS: { status: ShipmentStatus; label: string; emoji: string }[] = [
  { status: 'PENDING', label: 'Recibido', emoji: '📋' },
  { status: 'PREPARING', label: 'Preparando', emoji: '📦' },
  { status: 'READY_FOR_PICKUP', label: 'Listo para recoger', emoji: '🏪' },
  { status: 'SHIPPED', label: 'Enviado', emoji: '🚚' },
  { status: 'IN_TRANSIT', label: 'En camino', emoji: '🛣️' },
  { status: 'OUT_FOR_DELIVERY', label: 'En reparto', emoji: '🏍️' },
  { status: 'DELIVERED', label: 'Entregado', emoji: '✅' },
];

export const SHIPMENT_STEP_ORDER: Record<ShipmentStatus, number> = {
  PENDING: 0,
  PREPARING: 1,
  READY_FOR_PICKUP: 2,
  SHIPPED: 3,
  IN_TRANSIT: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
  FAILED: -1,
};

export const SHIPMENT_CHAINS: Record<DeliveryType, ShipmentStatus[]> = {
  PICKUP: ['PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERED'],
  HOME_DELIVERY: ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'],
  SHIPPING: ['PENDING', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
};
