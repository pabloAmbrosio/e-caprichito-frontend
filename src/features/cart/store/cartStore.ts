import { create } from 'zustand';
import type { CartWithPromotions } from '../domain/types';

interface CartState {
  cart: CartWithPromotions | null;
  isLoading: boolean;
  isDrawerOpen: boolean;

  setCart: (cart: CartWithPromotions | null) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  isDrawerOpen: false,

  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
