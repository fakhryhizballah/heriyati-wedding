"use client";

import { Minus, Plus, ShoppingBag, X } from "lucide-react";
// wovenPattern dihapus dari import
import { CartItem, CATEGORY_ACCENT, COLOR, WA_PHONE, toRupiah } from "@/src/lib/constants";

export default function CartView({ cart, setCart }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function updateQty(index: number, delta: number) {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  }

  function removeItem(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
  }

  function checkoutWA() {
    const lines = cart.map((item, i) => `${i + 1}. ${item.name} (${item.color}, ${item.size}) x${item.qty} — ${toRupiah(item.price * item.qty)}`);
    const msg = `Halo Heriyati Wedding, saya ingin memesan:\n\n${lines.join("\n")}\n\nTotal Estimasi: ${toRupiah(total)}\n\nMohon info ketersediaan & langkah selanjutnya. Terima kasih!`;
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  if (!cart.length) return (
    <div style={{ padding: "96px 32px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 999, display: "grid", placeItems: "center", margin: "0 auto 16px", background: COLOR.paper, border: `1px solid ${COLOR.line}` }}>
        <ShoppingBag size={22} color={COLOR.inkSoft} />
      </div>
      <p className="display-font" style={{ margin: 0, fontWeight: 800 }}>Keranjang masih kosong</p>
      <p className="body-font" style={{ margin: "4px 0 0", fontSize: 14, color: COLOR.inkSoft }}>Yuk telusuri katalog dan pilih baju atau layanan makeup favoritmu.</p>
    </div>
  );

  return (
    <div style={{ padding: "16px 16px 160px" }}>
      <h1 className="display-font" style={{ margin: "0 0 16px", fontSize: 22 }}>Keranjang</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cart.map((item, index) => {
          const accent = CATEGORY_ACCENT[item.category] || COLOR.ink;
          // Mengambil gambar pertama dari array, fallback string kosong jika tidak ada
          const imageUrl = item.image && item.image.length > 0 ? item.image[0] : "";

          return (
            <div key={`${item.id}-${index}`} style={{ display: "flex", gap: 12, padding: 12, borderRadius: 16, background: COLOR.paper, border: `1px solid ${COLOR.line}` }}>

              {/* Penggantian wovenPattern menjadi URL gambar dinamis */}
              <div style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: 12,
                backgroundColor: imageUrl ? "transparent" : COLOR.paper,
                backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="display-font" style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14, fontWeight: 800 }}>{item.name}</p>
                <p className="body-font" style={{ margin: "2px 0 0", fontSize: 12, color: COLOR.inkSoft }}>{item.color} · {item.size}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateQty(index, -1)} className="heart-button" style={{ width: 24, height: 24, border: `1px solid ${COLOR.line}` }}><Minus size={11} /></button>
                    <span className="body-font" style={{ width: 16, textAlign: "center", fontSize: 12, fontWeight: 800 }}>{item.qty}</span>
                    <button onClick={() => updateQty(index, 1)} className="heart-button" style={{ width: 24, height: 24, border: `1px solid ${COLOR.line}` }}><Plus size={11} /></button>
                  </div>
                  <p className="body-font" style={{ margin: 0, fontSize: 14, fontWeight: 800, color: accent }}>{toRupiah(item.price * item.qty)}</p>
                </div>
              </div>

              <button onClick={() => removeItem(index)} aria-label="hapus" style={{ alignSelf: "flex-start", padding: 4, border: 0, background: "transparent" }}>
                <X size={15} color={COLOR.inkSoft} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 64, maxWidth: "28rem", margin: "0 auto", padding: 16, background: COLOR.ivory, borderTop: `1px solid ${COLOR.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="body-font" style={{ fontSize: 14, fontWeight: 700, color: COLOR.inkSoft }}>Total Estimasi</span>
          <span className="display-font" style={{ fontSize: 20, fontWeight: 800 }}>{toRupiah(total)}</span>
        </div>
        <button onClick={checkoutWA} style={{ width: "100%", border: 0, borderRadius: 999, padding: "14px 16px", background: COLOR.sage, color: COLOR.paper, fontWeight: 800 }}>
          Checkout via WhatsApp
        </button>
      </div>
    </div>
  );
}