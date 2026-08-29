"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ALL_TAGS, CATEGORIES, CATEGORY_ACCENT, COLOR, Product } from "@/src/lib/constants";
import ProductCard from "./ProductCard";
import { Pill, StitchDivider } from "./ui";

export default function HomeView({ products, wishlist, toggleWishlist, onOpenProduct }: { products: Product[]; wishlist: Set<string>; toggleWishlist: (id: string) => void; onOpenProduct: (product: Product) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    const catalog = Array.isArray(products) ? products : [];
    let list = catalog.filter(product => {
      const query = search.toLowerCase();
      const matchSearch = product.name.toLowerCase().includes(query) || product.desc.toLowerCase().includes(query);
      const matchCategory = category === "Semua" || product.category === category;
      const matchTags = tags.length === 0 || tags.every(tag => product.tags.includes(tag));
      return matchSearch && matchCategory && matchTags;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => b.seed - a.seed);
    return list;
  }, [products, search, category, tags, sort]);

  function toggleTag(tag: string) { setTags(prev => prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag]); }

  return <div style={{ padding: "20px 16px 112px" }}>
    <header style={{ marginBottom: 16 }}><p className="body-font" style={{ margin: 0, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".2em", color: COLOR.brass }}>Heriyati Wedding</p><h1 className="display-font" style={{ margin: "2px 0 0", fontSize: 25, lineHeight: 1.2 }}>Sewa busana &amp; makeup pengantin</h1></header>
    <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 16px", background: COLOR.paper, border: `1px solid ${COLOR.line}` }}><Search size={16} color={COLOR.inkSoft} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kebaya, beskap, makeup…" aria-label="Cari produk" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: COLOR.ink }} /></div>
    <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>{ALL_TAGS.map(tag => <Pill key={tag} label={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)} accent={COLOR.ink} />)}</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16 }}><div style={{ display: "flex", gap: 16, overflowX: "auto" }}>{CATEGORIES.map(item => { const active = category === item; return <button key={item} onClick={() => setCategory(item)} style={{ position: "relative", padding: "0 0 6px", border: 0, background: "transparent", whiteSpace: "nowrap" }}><span className="display-font" style={{ fontSize: 14, fontWeight: 800, color: active ? COLOR.ink : COLOR.inkSoft }}>{item}</span>{active && <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2.5, borderRadius: 999, background: COLOR.brass }} />}</button>; })}</div><select value={sort} onChange={e => setSort(e.target.value)} aria-label="Urutkan produk" style={{ border: 0, outline: 0, background: "transparent", color: COLOR.inkSoft, fontSize: 12, fontWeight: 700 }}><option value="newest">Terbaru</option><option value="low">Harga ↑</option><option value="high">Harga ↓</option></select></div>
    <StitchDivider color={COLOR.line} />
    {!filtered.length ? <p className="body-font" style={{ margin: 0, padding: "64px 0", textAlign: "center", color: COLOR.inkSoft, fontSize: 14 }}>Tidak ada produk yang cocok. Coba ubah pencarian atau filter.</p> : <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} wishlisted={wishlist.has(product.id)} onToggleWishlist={toggleWishlist} onOpen={onOpenProduct} />)}</div>}
  </div>;
}
