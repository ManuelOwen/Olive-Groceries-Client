import { create } from 'zustand';

export interface CartItem {
  id: number | string;
  product_name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number | string) => void;
  decrementFromCart: (id: number | string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      } else {
        return {
          items: [...state.items, { ...item, quantity: 1 }],
        };
      }
    });
  },
  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },
  decrementFromCart: (id) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return {
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
          ),
        };
      } else {
        return {
          items: state.items.filter((i) => i.id !== id),
        };
      }
    });
  },
  clearCart: () => set({ items: [] }),
})); 