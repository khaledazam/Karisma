import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  category?: string;
  image: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartAnalytics = {
  totalAdds: number;
  productAdds: Record<
    string,
    { id: string; name: string; count: number; image: string; price: string }
  >;
  lastAddedAt?: string;
};

const CART_STORAGE_KEY = "kireeshna-cart";
const CART_ANALYTICS_KEY = "karisma-cart-analytics";

export function getCartAnalytics(): CartAnalytics {
  if (typeof window === "undefined") {
    return { totalAdds: 0, productAdds: {} };
  }
  try {
    const raw = window.localStorage.getItem(CART_ANALYTICS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return { totalAdds: 0, productAdds: {} };
}

function recordCartAdd(product: CartProduct) {
  if (typeof window === "undefined") return;
  try {
    const analytics = getCartAnalytics();
    analytics.totalAdds = (analytics.totalAdds || 0) + 1;
    analytics.lastAddedAt = new Date().toISOString();

    if (!analytics.productAdds) {
      analytics.productAdds = {};
    }

    const current = analytics.productAdds[product.id] || {
      id: product.id,
      name: product.name,
      count: 0,
      image: product.image,
      price: product.price,
    };

    current.count += 1;
    current.name = product.name;
    current.price = product.price;
    if (product.image) current.image = product.image;

    analytics.productAdds[product.id] = current;
    window.localStorage.setItem(CART_ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (err) {
    console.warn("Failed to record cart addition analytics:", err);
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addToCart: (product: CartProduct) => void;
  decrementFromCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // Ignore malformed storage values and start with an empty cart.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures.
    }
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      addToCart: (product) => {
        // Record analytics
        recordCartAdd(product);

        setItems((prev) => {
          const existing = prev.find((item) => item.id === product.id);
          if (existing) {
            return prev.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [...prev, { ...product, quantity: 1 }];
        });
      },
      decrementFromCart: (id) => {
        setItems((prev) =>
          prev
            .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      removeFromCart: (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      clearCart: () => {
        setItems([]);
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
