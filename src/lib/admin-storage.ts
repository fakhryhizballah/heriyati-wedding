import { Product } from "./constants";

export const PRODUCTS_STORAGE_KEY = "heriyati-wedding-products";
export const ADMIN_SESSION_KEY = "heriyati-wedding-admin-session";

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(products: Product[]) {
  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("heriyati-products-updated"));
}

export function isAdminLoggedIn() {
  return typeof window !== "undefined" && window.localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminLoggedIn(value: boolean) {
  if (value) window.localStorage.setItem(ADMIN_SESSION_KEY, "1");
  else window.localStorage.removeItem(ADMIN_SESSION_KEY);
}
