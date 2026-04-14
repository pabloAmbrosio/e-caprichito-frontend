import type { InventoryRepository } from '../../domain/InventoryRepository';
import { createInventory } from './createInventory';
import { getInventoryByProductId } from './getInventoryByProductId';
import { listInventory } from './listInventory';
import { reserveInventory } from './reserveInventory';
import { releaseInventory } from './releaseInventory';

export function createInventoryApi(): InventoryRepository {
  return {
    create: createInventory,
    getByProductId: getInventoryByProductId,
    list: listInventory,
    reserve: reserveInventory,
    release: releaseInventory,
  };
}
