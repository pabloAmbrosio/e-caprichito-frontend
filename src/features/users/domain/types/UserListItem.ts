import type { UserPublic } from './UserPublic';

export interface UserListItem extends UserPublic {
  lastLoginAt: string | null;
  deletedAt: string | null;
}
