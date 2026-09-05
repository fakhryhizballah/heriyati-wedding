"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
// wovenPattern dihapus dari import
import { CATEGORY_ACCENT, COLOR, Product, toRupiah } from "@/src/lib/constants";
import { HeartButton, Pill, StitchDivider } from "./ui";

type SelectedItem = Product & { color: string; size: string; qty: number };

export default function ProductSheet({ product, onClose, onAddToCart, wishlisted, onToggleWishlist }: { product: Product; onClose: () => void; onAddToCart: (item: SelectedItem) => void; wishlisted: boolean; onToggleWishlist: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [warn, setWarn] = useState(false);

  const accent = CATEGORY_ACCENT[product.category] || COLOR.ink;
  const sizeLabel = product.category === "Makeup" ? "Sesi" : "Ukuran";

  // Memastikan array gambar aman untuk diakses
  const images = Array.isArray(product.image) && product.image.length > 0 ? product.image : [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[galleryIdx] : "";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleClose() { setVisible(false); window.setTimeout(onClose, 220); }
  function handleAdd() {
    // if (!color || !size) { setWarn(true); window.setTimeout(() => setWarn(false), 1600); return; }
    onAddToCart({ ...product, color, size, qty });
    handleClose();
  }

  return (
    <div className="product-sheet" style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="sheet-backdrop" onClick={handleClose} style={{ backgroundColor: "rgba(28,24,17,.5)", opacity: visible ? 1 : 0 }} />
      <div className="sheet" style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}><div style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: COLOR.line }} /></div>
        <div className="sheet-scroll">

          <div style={{
            position: "relative",
            height: 208,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: hasImages ? "transparent" : COLOR.paper,
            backgroundImage: hasImages ? `url(${currentImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            {/* Hanya tampilkan tombol navigasi jika gambar lebih dari 1 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setGalleryIdx((i) => (i - 1 + images.length) % images.length)}
                  className="heart-button"
                  style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setGalleryIdx((i) => (i + 1) % images.length)}
                  className="heart-button"
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                >
                  <ChevronRight size={16} />
                </button>
                <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
                  {images.map((_, i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: i === galleryIdx ? accent : COLOR.paper }} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 16 }}>
            <div style={{ paddingRight: 12 }}><p className="body-font" style={{ margin: 0, fontSize: 12, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: ".08em" }}>{product.category}</p><h2 className="display-font" style={{ margin: "2px 0 0", fontSize: 22, lineHeight: 1.2 }}>{product.name}</h2></div>
            <HeartButton active={wishlisted} onClick={() => onToggleWishlist(product.id)} />
          </div>
          <p className="body-font" style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: accent }}>{toRupiah(product.price)}</p>
          <StitchDivider color={COLOR.line} />
          <p className="body-font" style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: COLOR.inkSoft }}>{product.desc}</p>

          {/* Render opsi hanya jika array memiliki isi */}
          {product.colors && product.colors.length > 0 && (
            <OptionGroup label="Warna" options={product.colors} value={color} onChange={setColor} accent={accent} />
          )}
          {product.sizes && product.sizes.length > 0 && (
            <OptionGroup label={sizeLabel} options={product.sizes} value={size} onChange={setSize} accent={accent} />
          )}

          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="body-font" style={{ margin: 0, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>Jumlah</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="heart-button" style={{ border: `1px solid ${COLOR.line}` }}><Minus size={14} /></button>
              <span className="body-font" style={{ width: 20, textAlign: "center", fontWeight: 800 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="heart-button" style={{ border: `1px solid ${COLOR.line}` }}><Plus size={14} /></button>
            </div>
          </div>
          {warn && <p className="body-font" style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: COLOR.maroon }}>Pilih warna dan {sizeLabel.toLowerCase()} terlebih dahulu.</p>}
        </div>
        <div className="sheet-footer"><button onClick={handleAdd} style={{ width: "100%", border: 0, borderRadius: 999, padding: "14px 16px", backgroundColor: accent, color: COLOR.paper, fontWeight: 800, letterSpacing: ".02em" }}>Tambah ke Keranjang · {toRupiah(product.price * qty)}</button></div>
      </div>
    </div>
  );
}

function OptionGroup({ label, options, value, onChange, accent }: { label: string; options: string[]; value: string | null; onChange: (value: string) => void; accent: string }) {
  return <div style={{ marginTop: 20 }}><p className="body-font" style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{options.map(o => <Pill key={o} label={o} active={value === o} onClick={() => onChange(o)} accent={accent} />)}</div></div>;
}