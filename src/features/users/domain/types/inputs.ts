import type { AdminRole, CustomerRole } from '@/shared/types/enums';

export interface CreateUserInput {
  username: string;
  password: string;
  adminRole: AdminRole;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  customerRole?: CustomerRole;
}

export interface UpdateUserInput {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  adminRole?: AdminRole;
  customerRole?: CustomerRole | null;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  adminRole?: AdminRole;
  customerRole?: CustomerRole;
  search?: string;
  sortBy?: 'createdAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}
