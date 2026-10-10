import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  image: string;
};

type WishlistContextValue = {
  items: WishlistProduct[];
  itemCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: WishlistProduct) => void;
  removeWishlistItem: (id: string) => void;
  clearWishlist: () => void;
};

const WISHLIST_STORAGE_KEY = "kireeshna-wishlist";

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as WishlistProduct[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // Ignore malformed storage values and continue with empty wishlist.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures.
    }
  }, [items]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      itemCount: items.length,
      isWishlisted: (id) => items.some((item) => item.id === id),
      toggleWishlist: (product) => {
        setItems((prev) => {
          const exists = prev.some((item) => item.id === product.id);
          if (exists) {
            return prev.filter((item) => item.id !== product.id);
          }
          return [...prev, product];
        });
      },
      removeWishlistItem: (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      clearWishlist: () => {
        setItems([]);
      },
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
