import { create } from 'zustand';

export interface FlySource {
  x: number;
  y: number;
  width: number;
  height: number;
  /** CSS background of the source button (used for the morph start color) */
  bg?: string;
}

interface FlyToCartState {
  /** Source rect (viewport-relative) of the button that triggered the animation */
  source: FlySource | null;
  /** Fires an animation from the given button rect */
  fire: (rect: FlySource) => void;
  /** Clears the current animation */
  clear: () => void;
}

export const useFlyToCartStore = create<FlyToCartState>((set) => ({
  source: null,
  fire: (rect) => set({ source: rect }),
  clear: () => set({ source: null }),
}));
