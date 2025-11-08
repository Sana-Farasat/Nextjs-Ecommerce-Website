import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // For localStorage

interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  getTotal: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i._id === newItem._id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i._id === newItem._id ? { ...i, quantity: i.quantity + newItem.quantity } : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i._id === id ? { ...i, quantity } : i)).filter((i) => i.quantity > 0),
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i._id !== id) })),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);