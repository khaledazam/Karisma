import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product, products as initialProducts, defaultCategories } from "@/lib/products";
import {
  getProductsServerFn,
  saveProductServerFn,
  deleteProductServerFn,
  getCategoriesServerFn,
  addCategoryServerFn,
  updateCategoryServerFn,
  deleteCategoryServerFn,
} from "@/lib/server-actions";

type ProductsContextValue = {
  products: Product[];
  categories: string[];
  addProduct: (newProduct: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  applyDiscountToProducts: (ids: string[], discountPercent: number) => Promise<void>;
  removeDiscountFromProducts: (ids: string[]) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  isLoading: boolean;
  isMongoSynced: boolean;
  reloadFromDb: () => Promise<void>;
};

const PRODUCTS_STORAGE_KEY = "karisma-custom-products-v1";
const CATEGORIES_STORAGE_KEY = "karisma-custom-categories-v1";
const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMongoSynced, setIsMongoSynced] = useState(false);

  // 1. Fetch from MongoDB on mount (Products & Categories concurrently)
  const fetchProductsFromMongo = async () => {
    try {
      const [res, catRes] = await Promise.all([
        getProductsServerFn().catch(() => null),
        getCategoriesServerFn().catch(() => null),
      ]);

      // Handle products
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const enriched = (res.data as Product[]).map((p) => {
          const demo = initialProducts.find((i) => i.id === p.id);
          if (demo?.video && !p.video) {
            return { ...p, video: demo.video };
          }
          return p;
        });
        setProducts(enriched);
        setIsMongoSynced(true);
        try {
          window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(enriched));
        } catch {}
      } else {
        loadFromLocalStorage();
      }

      // Handle categories
      if (catRes && catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
        setCategories(catRes.data);
        try {
          window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(catRes.data));
        } catch {}
      } else {
        loadCategoriesFromStorage();
      }
    } catch (err) {
      console.warn("⚠️ [useProducts] Could not load from MongoDB directly, using local cache:", err);
      loadFromLocalStorage();
      loadCategoriesFromStorage();
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((p: Product) => {
            const demo = initialProducts.find((i) => i.id === p.id);
            if (demo?.video && !p.video) {
              return { ...p, video: demo.video };
            }
            return p;
          });
          setProducts(merged);
          return;
        }
      }
    } catch {}
    setProducts(initialProducts);
  };

  const loadCategoriesFromStorage = () => {
    try {
      const saved = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          return;
        }
      }
    } catch {}
    setCategories(defaultCategories);
  };

  useEffect(() => {
    loadFromLocalStorage();
    loadCategoriesFromStorage();
    setIsLoading(false);

    // Defer background refresh so it doesn't block initial hydration / TTI
    const timer = setTimeout(() => {
      fetchProductsFromMongo();
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  // 2. Add product (syncs to MongoDB + local state)
  const addProduct = async (newProduct: Omit<Product, "id">) => {
    const id = `p_${Date.now()}`;
    const productWithId: Product = {
      ...newProduct,
      id,
    };

    setProducts((prev) => [productWithId, ...prev]);

    // Save to MongoDB
    try {
      const res = await saveProductServerFn({ data: productWithId as any });
      if (res && res.success) {
        setIsMongoSynced(true);
      }
    } catch (err) {
      console.error("Failed to sync new product to MongoDB:", err);
    }

    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify([productWithId, ...products]));
    } catch {}
  };

  // 3. Update product (syncs to MongoDB + local state)
  const updateProduct = async (id: string, updated: Partial<Product>) => {
    let fullUpdatedProduct: Product | undefined;

    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullUpdatedProduct = { ...item, ...updated };
          return fullUpdatedProduct;
        }
        return item;
      }),
    );

    if (fullUpdatedProduct) {
      try {
        await saveProductServerFn({ data: fullUpdatedProduct as any });
      } catch (err) {
        console.error("Failed to sync updated product to MongoDB:", err);
      }
    }
  };

  // 4. Delete product (syncs to MongoDB + local state)
  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteProductServerFn({ data: id });
    } catch (err) {
      console.error("Failed to delete product from MongoDB:", err);
    }
  };

  // 4b. Bulk apply discount to selected products
  const applyDiscountToProducts = async (ids: string[], discountPercent: number) => {
    const updatedProducts: Product[] = [];

    setProducts((prev) =>
      prev.map((item) => {
        if (!ids.includes(item.id)) return item;

        // Determine base price
        const basePriceStr = item.originalPrice || item.price;
        const baseNum = parseFloat(basePriceStr.replace(/[^0-9.]/g, "")) || 0;
        if (baseNum <= 0) return item;

        const discountedNum = Math.max(1, Math.round(baseNum * (1 - discountPercent / 100)));
        const updated: Product = {
          ...item,
          price: `${discountedNum} ج.م`,
          originalPrice: `${baseNum} ج.م`,
          discount: `خصم ${discountPercent}%`,
          badge: `خصم ${discountPercent}%`,
        };
        updatedProducts.push(updated);
        return updated;
      }),
    );

    // Sync each updated product to MongoDB
    for (const p of updatedProducts) {
      try {
        await saveProductServerFn({ data: p as any });
      } catch (err) {
        console.error("Failed to sync discounted product:", err);
      }
    }
  };

  // 4c. Remove discount from selected products
  const removeDiscountFromProducts = async (ids: string[]) => {
    const updatedProducts: Product[] = [];

    setProducts((prev) =>
      prev.map((item) => {
        if (!ids.includes(item.id)) return item;

        const originalPriceStr = item.originalPrice || item.price;
        const updated: Product = {
          ...item,
          price: originalPriceStr,
          originalPrice: undefined,
          discount: undefined,
          badge: undefined,
        };
        updatedProducts.push(updated);
        return updated;
      }),
    );

    for (const p of updatedProducts) {
      try {
        await saveProductServerFn({ data: p as any });
      } catch (err) {
        console.error("Failed to sync restored product:", err);
      }
    }
  };

  // 4d. Bulk delete products
  const bulkDeleteProducts = async (ids: string[]) => {
    setProducts((prev) => prev.filter((item) => !ids.includes(item.id)));
    for (const id of ids) {
      try {
        await deleteProductServerFn({ data: id });
      } catch (err) {
        console.error("Failed to bulk delete product:", err);
      }
    }
  };

  // 5. Add Category
  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    try {
      window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      await addCategoryServerFn({ data: trimmed });
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  // 6. Update Category Name (and update all products in it)
  const updateCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === "الكل" || oldName === trimmed) return;
    const updated = categories.map((c) => (c === oldName ? trimmed : c));
    setCategories(updated);

    // Update any products currently assigned to oldName
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
    );

    try {
      window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      await updateCategoryServerFn({ data: { oldName, newName: trimmed } });
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  };

  // 7. Delete Category (and move its products to "مستحضرات تجميل")
  const deleteCategory = async (name: string) => {
    if (name === "الكل") return;
    const updated = categories.filter((c) => c !== name);
    setCategories(updated);

    // Move products to "مستحضرات تجميل"
    setProducts((prev) =>
      prev.map((p) => (p.category === name ? { ...p, category: "مستحضرات تجميل" } : p))
    );

    try {
      window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      await deleteCategoryServerFn({ data: name });
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // 8. Reset to defaults
  const resetToDefaults = async () => {
    setProducts(initialProducts);
    setCategories(defaultCategories);
    try {
      window.localStorage.removeItem(PRODUCTS_STORAGE_KEY);
      window.localStorage.removeItem(CATEGORIES_STORAGE_KEY);
      for (const p of initialProducts) {
        await saveProductServerFn({ data: p as any });
      }
    } catch {}
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const value = useMemo(
    () => ({
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      applyDiscountToProducts,
      removeDiscountFromProducts,
      bulkDeleteProducts,
      addCategory,
      updateCategory,
      deleteCategory,
      resetToDefaults,
      getProductById,
      isLoading,
      isMongoSynced,
      reloadFromDb: fetchProductsFromMongo,
    }),
    [products, categories, isLoading, isMongoSynced],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return ctx;
}
