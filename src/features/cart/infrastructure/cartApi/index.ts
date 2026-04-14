import type { CartRepository } from '../../domain/CartRepository';
import { getCart } from './getCart';
import { getCartSummary } from './getCartSummary';
import { validateCart } from './validateCart';
import { clearCart } from './clearCart';
import { getCartHistory } from './getCartHistory';
import { restoreCart } from './restoreCart';
import { addItem } from './addItem';
import { addItemsBulk } from './addItemsBulk';
import { updateItem } from './updateItem';
import { removeItem } from './removeItem';
import { applyCoupon } from './applyCoupon';
import { removeCoupon } from './removeCoupon';
import { backofficeListCarts } from './backofficeListCarts';
import { backofficeListAbandoned } from './backofficeListAbandoned';
import { backofficeGetCartById } from './backofficeGetCartById';
import { backofficeDeleteCart } from './backofficeDeleteCart';

export function createCartApi(): CartRepository {
  return {
    get: getCart,
    getSummary: getCartSummary,
    validate: validateCart,
    clear: clearCart,
    getHistory: getCartHistory,
    restore: restoreCart,
    addItem,
    addItemsBulk,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
    backofficeList: backofficeListCarts,
    backofficeListAbandoned: backofficeListAbandoned,
    backofficeGetById: backofficeGetCartById,
    backofficeDelete: backofficeDeleteCart,
  };
}
