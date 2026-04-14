import type { AdminRole, CustomerRole } from '@/shared/types/enums';

export interface UserDeleted {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  adminRole: AdminRole;
  customerRole: CustomerRole | null;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}
