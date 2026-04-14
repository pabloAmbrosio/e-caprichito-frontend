import { create } from 'zustand';

interface LikedState {
  /** Set of product IDs the current user has liked */
  ids: Set<string>;
  /** Whether the store has been hydrated from the API */
  hydrated: boolean;
  hydrate: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useLikedStore = create<LikedState>((set) => ({
  ids: new Set<string>(),
  hydrated: false,

  hydrate: (ids) => set({ ids: new Set(ids), hydrated: true }),

  add: (id) =>
    set((state) => {
      const next = new Set(state.ids);
      next.add(id);
      return { ids: next };
    }),

  remove: (id) =>
    set((state) => {
      const next = new Set(state.ids);
      next.delete(id);
      return { ids: next };
    }),

  clear: () => set({ ids: new Set<string>(), hydrated: false }),
}));
