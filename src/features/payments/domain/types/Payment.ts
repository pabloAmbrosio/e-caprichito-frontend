import type { PaymentStatus, PaymentMethod } from '@/shared/types/enums';
import type { ManualTransferProofData } from './ManualTransferProofData';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerData: ManualTransferProofData | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}
