import { create } from 'zustand';

interface CartState {
  itemCount: number; // chỉ lưu count để hiển thị badge
  setItemCount: (n: number) => void;
  incrementCount: (n?: number) => void;
  decrementCount: (n?: number) => void;
  clearCount: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  setItemCount: (n) => set({ itemCount: n }),
  incrementCount: (n = 1) => set((state) => ({ itemCount: state.itemCount + n })),
  decrementCount: (n = 1) => set((state) => ({ itemCount: Math.max(0, state.itemCount - n) })),
  clearCount: () => set({ itemCount: 0 }),
}));
