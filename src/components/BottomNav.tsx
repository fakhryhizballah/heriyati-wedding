"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import { COLOR } from "@/src/lib/constants";

export type View = "home" | "cart" | "profile";

export default function BottomNav({ view, setView, cartCount }: { view: View; setView: (view: View) => void; cartCount: number }) {
  const items = [{ key: "home" as const, label: "Katalog", icon: Search }, { key: "cart" as const, label: "Keranjang", icon: ShoppingBag }, { key: "profile" as const, label: "Profil", icon: User }];
  return <nav className="bottom-nav"><div className="bottom-nav-inner">{items.map(({ key, label, icon: Icon }) => { const active = view === key; return <button key={key} onClick={() => setView(key)} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 16px", border: 0, background: "transparent", color: active ? COLOR.maroon : COLOR.inkSoft }} aria-current={active ? "page" : undefined}><span style={{ position: "relative", display: "inline-flex" }}><Icon size={20} strokeWidth={active ? 2.4 : 2} />{key === "cart" && cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -9, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 9, fontWeight: 800, color: COLOR.paper, background: COLOR.maroon }}>{cartCount}</span>}</span><span className="body-font" style={{ fontSize: 10, fontWeight: 700 }}>{label}</span></button>; })}</div></nav>;
}
