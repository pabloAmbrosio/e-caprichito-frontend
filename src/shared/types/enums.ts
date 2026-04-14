export type AdminRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'SELLER' | 'CUSTOMER';

export type CustomerRole = 'MEMBER' | 'VIP_FAN' | 'VIP_LOVER' | 'VIP_LEGEND';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type DeliveryType = 'PICKUP' | 'HOME_DELIVERY' | 'SHIPPING';

export type ShipmentStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED';

/** @deprecated Use ShipmentStatus instead */
export type DeliveryStatus = 'PREPARING' | 'SHIPPED' | 'DELIVERED';

export type PaymentStatus =
  | 'PENDING'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentMethod = 'MANUAL_TRANSFER' | 'CASH_ON_DELIVERY';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type RuleOperator = 'ALL' | 'ANY';

export type RuleType =
  | 'PRODUCT'
  | 'CATEGORY'
  | 'TAG'
  | 'CART_MIN_TOTAL'
  | 'CART_MIN_QUANTITY'
  | 'CUSTOMER_ROLE'
  | 'FIRST_PURCHASE';

export type ComparisonOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IN'
  | 'NOT_IN'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL';

export type ActionType = 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'BUY_X_GET_Y';

export type ActionTarget = 'PRODUCT' | 'CART' | 'CHEAPEST_ITEM';
