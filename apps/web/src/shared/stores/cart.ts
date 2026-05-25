import { create } from 'zustand';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find(i => i.productId === item.productId);
    if (existing) {
      set({
        items: get().items.map(i =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  removeItem: (productId) => set({ items: get().items.filter(i => i.productId !== productId) }),
  updateQuantity: (productId, quantity) => set({
    items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i)
  }),
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}));
