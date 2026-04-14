import type { PaymentStatus, PaymentMethod } from '@/shared/types/enums';

export interface OrderPaymentSummary {
  status: PaymentStatus;
  amount: number;
  method: PaymentMethod;
}
