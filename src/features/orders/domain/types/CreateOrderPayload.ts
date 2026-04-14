import type { PaymentMethod } from '@/shared/types/enums';

export interface CreateOrderPayload {
  addressId?: string;
  paymentMethod: PaymentMethod;
  discountTotalInCents?: number;
  expirationMinutes?: number;
}
