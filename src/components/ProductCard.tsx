"use client";

import { CATEGORY_ACCENT, COLOR, Product, toRupiah, wovenPattern } from "@/src/lib/constants";
import { HeartButton } from "./ui";

export default function ProductCard({ product, wishlisted, onToggleWishlist, onOpen }: { product: Product; wishlisted: boolean; onToggleWishlist: (id: string) => void; onOpen: (product: Product) => void }) {
  const accent = CATEGORY_ACCENT[product.category];
  return (
    <article className="product-card" onClick={() => onOpen(product)}>
      <div className="product-art" style={wovenPattern(accent, product.seed)}>
        <div style={{ position: "absolute", top: 8, right: 8 }}><HeartButton active={wishlisted} onClick={() => onToggleWishlist(product.id)} /></div>
        <div className="product-badge" style={{ backgroundColor: accent, color: COLOR.paper }}>{product.category}</div>
      </div>
      <div style={{ padding: 12 }}>
        <p className="display-font" style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{product.name}</p>
        <p className="body-font" style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 800, color: accent }}>{toRupiah(product.price)}</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>{product.tags.slice(0, 2).map((tag) => <span key={tag} className="body-font" style={{ fontSize: 10, color: COLOR.inkSoft }}>{tag}</span>)}</div>
      </div>
    </article>
  );
}
