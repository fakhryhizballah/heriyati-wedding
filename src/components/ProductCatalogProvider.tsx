"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS, Product } from "@/src/lib/constants";
import { getStoredProducts, saveStoredProducts } from "@/src/lib/admin-storage";

type ProductContextValue = {
  products: Product[];
  setProducts: (products: Product[]) => void;
  resetProducts: () => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductCatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    const stored = getStoredProducts();
    if (stored.length) setProductsState(stored);
    const onUpdate = () => {
      const next = getStoredProducts();
      setProductsState(next.length ? next : PRODUCTS);
    };
    window.addEventListener("heriyati-products-updated", onUpdate);
    return () => window.removeEventListener("heriyati-products-updated", onUpdate);
  }, []);

  const value = useMemo(() => ({
    products,
    setProducts(next: Product[]) {
      setProductsState(next);
      saveStoredProducts(next);
    },
    resetProducts() {
      window.localStorage.removeItem("heriyati-wedding-products");
      setProductsState(PRODUCTS);
      window.dispatchEvent(new Event("heriyati-products-updated"));
    },
  }), [products]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductCatalog() {
  const value = useContext(ProductContext);
  // if (!value) throw new Error("useProductCatalog must be used inside ProductCatalogProvider");
  // return value;
  return value ?? { products: PRODUCTS, setProducts: () => { }, resetProducts: () => { } };
}
