import type { UserRepository } from '../../domain/UserRepository';
import { createUser } from './createUser';
import { listUsers } from './listUsers';
import { getUserById } from './getUserById';
import { updateUser } from './updateUser';
import { deleteUser } from './deleteUser';
import { restoreUser } from './restoreUser';

export function createUserApi(): UserRepository {
  return {
    create: createUser,
    list: listUsers,
    getById: getUserById,
    update: updateUser,
    delete: deleteUser,
    restore: restoreUser,
  };
}
