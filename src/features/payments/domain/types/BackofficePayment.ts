import type { AdminRole, OrderStatus } from '@/shared/types/enums';
import type { Payment } from './Payment';

export interface BackofficePayment extends Payment {
  reviewer: { id: string; username: string; adminRole: AdminRole } | null;
  customer: { id: string; username: string; phone: string | null; email: string | null };
  order: {
    id: string;
    status: OrderStatus;
    items: Array<{
      id: string;
      quantity: number;
      product: { id: string; title: string; priceInCents: number };
    }>;
  };
}
