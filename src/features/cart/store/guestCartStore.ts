import { create } from 'zustand';
import type { GuestCartItem } from '../infrastructure/guestCartStorage';
import {
  getGuestCart,
  setGuestCart,
  clearGuestCart,
} from '../infrastructure/guestCartStorage';

interface GuestCartState {
  items: GuestCartItem[];

  hydrate: () => void;
  addItem: (item: GuestCartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  /** Refresh prices for items whose backend price may have changed */
  refreshItemPrices: (updates: { productId: string; unitPrice: number }[]) => void;
}

export const useGuestCartStore = create<GuestCartState>((set, get) => ({
  items: [],

  hydrate: () => {
    set({ items: getGuestCart() });
  },

  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    let next: GuestCartItem[];
    if (existing) {
      next = get().items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i,
      );
    } else {
      next = [...get().items, item];
    }
    set({ items: next });
    setGuestCart(next);
  },

  updateQuantity: (productId, quantity) => {
    const next = get().items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i,
    );
    set({ items: next });
    setGuestCart(next);
  },

  removeItem: (productId) => {
    const next = get().items.filter((i) => i.productId !== productId);
    set({ items: next });
    setGuestCart(next);
  },

  clear: () => {
    set({ items: [] });
    clearGuestCart();
  },

  refreshItemPrices: (updates) => {
    const priceMap = new Map(updates.map((u) => [u.productId, u.unitPrice]));
    const next = get().items.map((item) =>
      priceMap.has(item.productId)
        ? { ...item, unitPrice: priceMap.get(item.productId)! }
        : item,
    );
    set({ items: next });
    setGuestCart(next);
  },
}));
