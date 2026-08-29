"use client";

import { useState } from "react";
import BottomNav, { View } from "@/src/components/BottomNav";
import CartView from "@/src/components/CartView";
import HomeView from "@/src/components/HomeView";
import ProductSheet from "@/src/components/ProductSheet";
import ProfileView from "@/src/components/ProfileView";
import { CartItem, Product } from "@/src/lib/constants";
import { useProductCatalog } from "@/src/components/ProductCatalogProvider";

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products } = useProductCatalog();

  function toggleWishlist(id: string) {
    setWishlist(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function addToCart(item: CartItem) { setCart(prev => [...prev, item]); }
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return <main className="app-shell">
    {view === "home" && <HomeView products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} onOpenProduct={setSelectedProduct} />}
    {view === "cart" && <CartView cart={cart} setCart={setCart} />}
    {view === "profile" && <ProfileView />}
    {selectedProduct && <ProductSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} wishlisted={wishlist.has(selectedProduct.id)} onToggleWishlist={toggleWishlist} />}
    <BottomNav view={view} setView={setView} cartCount={cartCount} />
  </main>;
}
