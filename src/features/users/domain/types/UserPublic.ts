import type { AdminRole, CustomerRole } from '@/shared/types/enums';

export interface UserPublic {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  adminRole: AdminRole;
  customerRole: CustomerRole | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
