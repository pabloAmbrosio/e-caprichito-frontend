import type {
  UserPublic,
  UserListItem,
  UserDetail,
  UserDeleted,
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
} from './types';

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserPublic>;
  list(query?: ListUsersQuery): Promise<{ items: UserListItem[]; pagination: unknown }>;
  getById(id: string): Promise<UserDetail>;
  update(id: string, input: UpdateUserInput): Promise<UserPublic>;
  delete(id: string): Promise<UserDeleted>;
  restore(id: string): Promise<UserPublic>;
}
