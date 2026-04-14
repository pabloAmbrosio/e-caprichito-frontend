import type { AdminRole, CustomerRole } from './roles';

export interface Usuario {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  adminRole: AdminRole;
  customerRole: CustomerRole | null;
  phoneVerified: boolean;
}
