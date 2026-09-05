"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Pencil, Save, Trash2, Upload, X, Download, Loader2 } from "lucide-react";
import { CATEGORIES, Category, Product, toRupiah } from "@/src/lib/constants";
import StatGrid from "./_components/StatGrid"; // Import komponen colocation

const EMPTY = {
  name: "",
  category: "Baju Adat" as Category,
  price: 0,
  tags: [] as string[],
  desc: "",
  colors: [] as string[],
  sizes: [] as string[],
  image: [] as string[]
};

const THUMB_SIZE = 96;

function splitList(value: string) {
  return value.split(",").map(s => s.trimStart());
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // States Form & UI
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  // States Upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setNewPreviewUrls(urls);
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  async function fetchProducts() {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      notify("Gagal memuat data dari database.");
    } finally {
      setIsLoadingData(false);
    }
  }

  const filtered = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ),
    [products, query]);

  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  function resetForm() {
    setForm(EMPTY);
    setEditId(null);
    setImageFiles([]);
  }

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  }

  const removeSavedImage = (indexToRemove: number) => {
    const updatedImages = form.image.filter((_: string, index: number) => index !== indexToRemove);
    setForm({ ...form, image: updatedImages });
  };

  const removeNewFile = (indexToRemove: number) => {
    const updatedFiles = imageFiles.filter((_: File, index: number) => index !== indexToRemove);
    setImageFiles(updatedFiles);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      notify("Lengkapi nama dan harga dengan benar.");
      return;
    }

    setIsUploading(true);
    let finalImageUrls: string[] = Array.isArray(form.image) ? [...form.image] : [];

    if (imageFiles.length > 0) {
      try {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || data.error || `Gagal upload gambar.`);

        const rawList: any[] = data?.data ?? data?.files ?? data?.urls ?? data?.images ?? (Array.isArray(data) ? data : []);
        const uploadedUrls: string[] = (Array.isArray(rawList) ? rawList : [])
          .map((item: any) => typeof item === "string" ? item : item?.url || item?.secure_url || item?.path || item?.location)
          .filter((url: unknown): url is string => typeof url === "string" && url.length > 0);

        if (uploadedUrls.length === 0) throw new Error("Upload selesai tapi URL gambar tidak ditemukan pada response.");

        finalImageUrls = [...finalImageUrls, ...uploadedUrls];

      } catch (err) {
        console.error("Error saat upload gambar:", err);
        notify(err instanceof Error ? err.message : "Error saat upload.");
        setIsUploading(false);
        return;
      }
    }

    const payload = { ...form, image: finalImageUrls };

    try {
      const url = editId ? `/api/products/${editId}` : "/api/products";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan data");

      notify(editId ? "Produk diperbarui." : "Produk ditambahkan.");
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("Error saat menyimpan produk:", err);
      notify(err instanceof Error ? err.message : "Error");
    } finally {
      setIsUploading(false);
    }
  }

  function edit(product: Product) {
    setEditId(product.id);
    setImageFiles([]);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      tags: product.tags || [],
      desc: product.desc || "",
      colors: product.colors || [],
      sizes: product.sizes || [],
      image: product.image || []
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus produk ini secara permanen dari database?")) return;

    setIsUploading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus produk");

      notify("Produk dihapus.");
      if (editId === id) resetForm();
      fetchProducts();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Error");
    } finally {
      setIsUploading(false);
    }
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploading(true);
        const text = String(reader.result || "");
        let parsed: any[];

        if (file.name.toLowerCase().endsWith(".json")) {
          const json = JSON.parse(text);
          parsed = Array.isArray(json) ? json : json.products || [];
        } else {
          const lines = text.split(/\r?\n/).filter(Boolean);
          const headers = (lines.shift() || "").split(",").map(v => v.trim());
          parsed = lines.map(line => {
            const cells = line.match(/(?:"([^"]*)")|([^,]+)/g)?.map(x => x.replace(/^"|"$/g, "")) || [];
            return Object.fromEntries(headers.map((h, i) => [h, cells[i] || ""]));
          });
        }

        const uploadPromises = parsed.map(async (p: any) => {
          const payload = {
            name: p.name,
            category: p.category || "Baju Adat",
            price: Number(p.price || 0),
            desc: p.desc || "",
            tags: form.tags.map(t => t.trim()).filter(Boolean),
            colors: form.colors.map(c => c.trim()).filter(Boolean),
            sizes: form.sizes.map(s => s.trim()).filter(Boolean),
            image: Array.isArray(p.image) ? p.image : p.image ? [p.image] : [],
          };

          return fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        });

        await Promise.all(uploadPromises);
        notify("Proses import selesai!");
        fetchProducts();
      } catch (err) {
        notify(err instanceof Error ? err.message : "Error");
      } finally {
        setIsUploading(false);
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "heriyati-products-db.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {message && <div className="admin-toast">{message}</div>}

      <StatGrid totalProducts={products.length} totalValue={totalValue} />

      <div className="admin-layout">
        {/* --- FORM PANEL --- */}
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>{editId ? "Edit Produk" : "Tambah Produk"}</h2>
              <p>Isi detail produk yang akan tampil di katalog.</p>
            </div>
            {editId && (
              <button className="admin-icon-button" onClick={resetForm} disabled={isUploading}>
                <X size={17} />
              </button>
            )}
          </div>

          <form className="admin-product-form" onSubmit={submit}>
            {/* Field Nama */}
            <label>
              Nama produk
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Kebaya Sunda Ratri"
                disabled={isUploading}
                required
              />
            </label>

            <div className="admin-two-col">
              {/* Field Kategori */}
              <label>
                Kategori
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category })}
                  disabled={isUploading}
                >
                  {CATEGORIES.filter(c => c !== "Semua").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              {/* Field Harga */}
              <label>
                Harga
                <input
                  type="number"
                  min={0}
                  value={form.price || ""}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="850000"
                  disabled={isUploading}
                  required
                />
              </label>
            </div>

            <label>
              Deskripsi
              <textarea
                rows={4}
                value={form.desc}
                onChange={e => setForm({ ...form, desc: e.target.value })}
                placeholder="Deskripsi produk atau layanan..."
                disabled={isUploading}
              />
            </label>

            <label>
              Tags <span className="admin-help">pisahkan dengan koma</span>
              <input
                value={form.tags.join(", ")}
                onChange={e => setForm({ ...form, tags: splitList(e.target.value) })}
                placeholder="#Premium, #Jawa"
                disabled={isUploading}
              />
            </label>

            <div className="admin-two-col">
              <label>
                Warna <span className="admin-help">pisahkan dengan koma</span>
                <input
                  value={form.colors.join(", ")}
                  onChange={e => setForm({ ...form, colors: splitList(e.target.value) })}
                  placeholder="Ivory, Maroon"
                  disabled={isUploading}
                />
              </label>
              <label>
                Ukuran / Sesi <span className="admin-help">pisahkan dengan koma</span>
                <input
                  value={form.sizes.join(", ")}
                  onChange={e => setForm({ ...form, sizes: splitList(e.target.value) })}
                  placeholder="S, M, L, XL"
                  disabled={isUploading}
                />
              </label>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                Foto produk <span className="admin-help">akan diupload ke CDN (bisa pilih banyak)</span>
              </label>

              {/* Preview Gambar Tersimpan */}
              {form.image && form.image.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {form.image.map((imgUrl: string, index: number) => (
                    <div key={`saved-${index}`} style={{ position: "relative", width: THUMB_SIZE, height: THUMB_SIZE, flexShrink: 0 }}>
                      <img src={imgUrl} alt={`Tersimpan ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid #d1d5db" }} />
                      <button type="button" onClick={() => removeSavedImage(index)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(239,68,68,0.9)", color: "#fff", borderRadius: 9999, border: "none", padding: 4, cursor: "pointer" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview File Baru */}
              {imageFiles.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {imageFiles.map((file: File, index: number) => (
                    <div key={`new-${index}`} style={{ position: "relative", width: THUMB_SIZE, height: THUMB_SIZE, flexShrink: 0 }}>
                      <img src={newPreviewUrls[index]} alt={`Baru ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "2px solid #3b82f6" }} />
                      <button type="button" onClick={() => removeNewFile(index)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(239,68,68,0.9)", color: "#fff", borderRadius: 9999, border: "none", padding: 4, cursor: "pointer" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Area Upload Dropzone */}
              <label style={{ display: "block", cursor: isUploading ? "not-allowed" : "pointer" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, border: "2px dashed #d1d5db", borderRadius: 10, background: isUploading ? "#f9fafb" : "transparent" }}>
                  <ImagePlus size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 14, color: "#4b5563" }}>Klik untuk menambah gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={e => {
                      if (e.target.files) {
                        setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                    disabled={isUploading}
                  />
                </div>
              </label>
            </div>

            <button className="admin-primary-button" type="submit" disabled={isUploading}>
              {isUploading ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {isUploading ? "Menyimpan Data..." : editId ? "Simpan Perubahan" : "Tambah ke Katalog"}
            </button>
          </form>
        </section>

        {/* --- LIST PANEL --- */}
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Data Produk</h2>
              <p>{filtered.length} produk ditampilkan</p>
            </div>
            <div className="admin-row-actions">
              <label className="admin-import-button">
                <Upload size={15} /> Import JSON/CSV
                <input type="file" accept=".json,.csv,application/json,text/csv" onChange={handleImport} disabled={isUploading} style={{ display: "none" }} />
              </label>
              <button className="admin-ghost-button" onClick={exportJson} disabled={isUploading}>
                <Download size={15} /> Export
              </button>
            </div>
          </div>

          <input className="admin-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari produk..." disabled={isUploading || isLoadingData} />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingData ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                      <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto" }} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {product.image?.length > 0 ? (
                            <img src={product.image[0]} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImagePlus size={16} color="#aaa" />
                            </div>
                          )}
                          <div>
                            <strong>{product.name}</strong>
                            <small style={{ display: 'block' }}>{product.tags?.join(" · ") || "Tanpa tag"}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="admin-category-badge">{product.category}</span></td>
                      <td>{toRupiah(product.price)}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button className="admin-icon-button" onClick={() => edit(product)} disabled={isUploading}><Pencil size={15} /></button>
                          <button className="admin-icon-button danger" onClick={() => remove(product.id)} disabled={isUploading}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-tools">
            <button className="admin-ghost-button" onClick={fetchProducts} disabled={isUploading || isLoadingData}>
              Refresh Data dari Database
            </button>
          </div>
        </section>
      </div>
    </>
  );
}