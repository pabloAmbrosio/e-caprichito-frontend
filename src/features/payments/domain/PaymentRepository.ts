import type { Payment, BackofficePayment } from './types';
import type { PaymentStatus } from '@/shared/types/enums';

export interface PaymentRepository {
  // Shop
  create(orderId: string, method: 'MANUAL_TRANSFER'): Promise<Payment>;
  uploadProof(id: string, data: { screenshotUrl: string; bankReference?: string }): Promise<Payment>;
  getById(id: string): Promise<Payment>;
  list(params?: {
    page?: number; limit?: number; status?: PaymentStatus;
  }): Promise<{ items: Payment[]; pagination: unknown }>;

  // Backoffice
  backofficeList(params?: {
    page?: number; limit?: number; status?: PaymentStatus;
  }): Promise<{ items: BackofficePayment[]; pagination: unknown }>;
  backofficeGetById(id: string): Promise<BackofficePayment>;
  backofficeReview(
    id: string,
    action: 'APPROVE' | 'REJECT',
    note?: string,
  ): Promise<BackofficePayment>;
}
