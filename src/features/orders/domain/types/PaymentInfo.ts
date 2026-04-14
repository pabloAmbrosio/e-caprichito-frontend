import type { OrderStatus, DeliveryType, PaymentStatus, PaymentMethod } from '@/shared/types/enums';

export interface PaymentInfoLastPayment {
  id: string;
  status: PaymentStatus;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentInfoBankDetails {
  bankName: string;
  accountHolder: string;
  clabe: string;
  accountNumber: string;
}

export interface PaymentInfo {
  orderId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  total: number;
  expiresAt: string | null;
  lastPayment: PaymentInfoLastPayment | null;
  bankDetails: PaymentInfoBankDetails;
  concepto: string;
}
