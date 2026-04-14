import type { UserListItem } from './UserListItem';

export interface UserDetail extends UserListItem {
  googleId: string | null;
  _count: {
    orders: number;
    allCarts: number;
  };
}
