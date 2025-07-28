import { create } from 'zustand';
import { createOrder} from '@/api/orders';
import { useAuthStore } from './authStore';
import { OrderStatus } from '@/interfaces/orderInterface';

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
  updateItemPrice: (id: number | string, price: number) => void;
}

function getCartStorageKey(userId: string | number | undefined) {
  return userId ? `cart-items-${userId}` : 'cart-items-guest';
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (item) => {
    set((state) => {
      // Ensure price is a number
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const existing = state.items.find((i) => i.id === item.id);
      let newItems;
      if (existing) {
        newItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, price, quantity: 1 }];
      }
      // Persist to localStorage only
      const userId = useAuthStore.getState().user?.id;
      localStorage.setItem(getCartStorageKey(userId), JSON.stringify(newItems));
      return { items: newItems };
    });
  },
  removeFromCart: (id) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      const userId = useAuthStore.getState().user?.id;
      localStorage.setItem(getCartStorageKey(userId), JSON.stringify(newItems));
      return { items: newItems };
    });
  },
  decrementFromCart: (id) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === id);
      let newItems;
      if (existing && existing.quantity > 1) {
        newItems = state.items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        newItems = state.items.filter((i) => i.id !== id);
      }
      const userId = useAuthStore.getState().user?.id;
      localStorage.setItem(getCartStorageKey(userId), JSON.stringify(newItems));
      return { items: newItems };
    });
  },
  clearCart: () => {
    const userId = useAuthStore.getState().user?.id;
    localStorage.removeItem(getCartStorageKey(userId));
    set({ items: [] });
  },
  updateItemPrice: (id, price) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, price } : item
      );
      const userId = useAuthStore.getState().user?.id;
      localStorage.setItem(getCartStorageKey(userId), JSON.stringify(newItems));
      return { items: newItems };
    });
  },
}));

// Load cart from localStorage on user change and on initial load
if (typeof window !== 'undefined') {
  let lastUserId = useAuthStore.getState().user?.id;
  const loadCartForUser = async (userId: string | number | undefined) => {
    // Load directly from localStorage
    const stored = localStorage.getItem(getCartStorageKey(userId));
    if (stored) {
      try {
        useCartStore.setState({ items: JSON.parse(stored) });
      } catch {
        useCartStore.setState({ items: [] });
      }
    } else {
      useCartStore.setState({ items: [] });
    }
  };

  // Load cart on initial page load
  loadCartForUser(lastUserId);

  useAuthStore.subscribe((state) => {
    const currentUserId = state.user?.id;
    if (currentUserId !== lastUserId) {
      loadCartForUser(currentUserId);
      lastUserId = currentUserId;
    }
  });
}

// --- Cart Sync Logic ---
// Helper to safely calculate total
function calculateTotal(items: CartItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, i) => {
    const price = typeof i.price === 'string' ? parseFloat(i.price) : (typeof i.price === 'number' ? i.price : 0);
    const quantity = typeof i.quantity === 'number' ? i.quantity : 1;
    return sum + price * quantity;
  }, 0);
}

// Create order in database during checkout
async function createOrderInDatabase(userId: string | number, items: CartItem[], total: number, pickupStation?: any) {
  // Format items to match the expected structure
  const formattedItems = items.map(item => ({
    id: item.id,
    product_name: item.product_name,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl
  }));

  // Format pickup station as a string for shipping_address
  let shippingAddress = useAuthStore.getState().user?.address || '';
  if (pickupStation) {
    shippingAddress = `Pickup: ${pickupStation.name}, ${pickupStation.location}, ${pickupStation.district}`;
  }
  console.log('[Checkout] Creating order with items:', formattedItems, 'Shipping address:', shippingAddress);
  
  try {
    // Create a new order with CONFIRMED status
    const response = await createOrder({
      user_id: userId,
      items: formattedItems,
      total_amount: total,
      status: OrderStatus.CONFIRMED,
      shipping_address: shippingAddress,
    } as any);

    console.log('[Checkout] Order created successfully:', response);
    return response;
  } catch (err) {
    console.error('[Checkout] Error creating order:', err);
    throw err;
  }
}

// --- Checkout Logic ---
export async function checkoutCart(pickupStation?: any) {
  const userId = useAuthStore.getState().user?.id;
  const items = useCartStore.getState().items;
  
  if (!userId || items.length === 0) {
    throw new Error('Cannot checkout: No user logged in or cart is empty');
  }

  try {
    // Calculate total
    const total = calculateTotal(items);
    
    // Create the order in the database
    await createOrderInDatabase(userId, items, total, pickupStation);
    
    // Clear the cart after successful checkout
    useCartStore.getState().clearCart();
    
    return true;
  } catch (err) {
    console.error('Checkout failed:', err);
    throw err;
  }
} 