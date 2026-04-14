import type { AdminRole, CustomerRole } from './roles';

export interface JWTPayload {
  userId: string;
  username: string;
  phone: string | null;
  email: string | null;
  adminRole: AdminRole;
  customerRole: CustomerRole | null;
  phoneVerified: boolean;
  iat: number;
  exp: number;
}
