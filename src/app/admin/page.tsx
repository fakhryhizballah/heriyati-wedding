"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3, FileJson, ImagePlus, PackagePlus,
  Pencil, Save, Trash2, Upload, X, Download, Loader2
} from "lucide-react";
import { CATEGORIES, Category, Product, toRupiah } from "@/src/lib/constants";
import LogoutButton from "@/src/components/LogoutButton";


// State awal form
const EMPTY = {
  name: "",
  category: "Baju Adat" as Category,
  price: 0,
  tags: [] as string[],
  desc: "",
  colors: [] as string[],
  sizes: [] as string[],
  image: "", // UI handle 1 gambar, API handle array
};

function splitList(value: string) {
  return value.split(",").map(s => s.trimStart());
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);


  // States Form & UI
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  // States Upload
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // --- MENGAMBIL DATA DARI API ---
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      notify("Gagal memuat data dari database.");
    } finally {
      setIsLoadingData(false);
    }
  }

  // Pencarian & Kalkulasi
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
  // Fungsi menghapus gambar yang sudah tersimpan di database
  const removeSavedImage = (indexToRemove: number) => {
    const updatedImages = form.image.filter((_: string, index: number) => index !== indexToRemove);
    setForm({ ...form, image: updatedImages });
  };

  // Fungsi menghapus gambar baru yang baru saja dipilih
  const removeNewFile = (indexToRemove: number) => {
    const updatedFiles = imageFiles.filter((_: File, index: number) => index !== indexToRemove);
    setImageFiles(updatedFiles);
  };

  // --- FUNGSI SUBMIT (CREATE / UPDATE KE API) ---
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      notify("Lengkapi nama dan harga dengan benar.");
      return;
    }

    setIsUploading(true);
    // let finalImageUrl = form.image;
    let finalImageUrls: string[] = Array.isArray(form.image) ? [...form.image] : [];

    // 1. Upload Gambar jika ada file baru
    if (imageFiles.length > 0) {
      try {
        const formData = new FormData();

        // Append semua file ke dalam FormData
        // Pastikan key "files" (atau "file") sesuai dengan yang diekspektasikan backend/API Anda
        imageFiles.forEach((file) => {
          formData.append("files", file);
        });

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Gagal upload gambar.");

        // Ekstrak semua URL dari response API
        // Asumsi response CDN/API: { data: [{ url: '...' }, { url: '...' }] }
        const uploadedUrls = data.data.map((img: { url: string }) => img.url);

        // Gabungkan gambar lama dengan gambar yang baru diupload
        // (Ubah jadi `finalImageUrls = uploadedUrls;` jika ingin replace total)
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];

      } catch (err) {
        notify(err instanceof Error ? err.message : "Error saat upload.");
        setIsUploading(false);
        return;
      }
    }

    // 2. Siapkan Payload (Sesuaikan dengan Schema Mongoose)
    const payload = {
      ...form,
      image: finalImageUrls, // Schema image berupa array of string
    };

    // 3. Simpan ke Database
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
      fetchProducts(); // Refresh list produk dari DB
    } catch (err) {
      notify(err instanceof Error ? err.message : "Error");
    } finally {
      setIsUploading(false);
    }
  }

  // --- FUNGSI EDIT ---
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

  // --- FUNGSI HAPUS ---
  async function remove(id: string) {
    if (!window.confirm("Hapus produk ini secara permanen dari database?")) return;

    setIsUploading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus produk");

      notify("Produk dihapus.");
      if (editId === id) resetForm();
      fetchProducts(); // Refresh tabel
    } catch (err) {
      notify(err instanceof Error ? err.message : "Error");
    } finally {
      setIsUploading(false);
    }
  }

  // --- FUNGSI IMPORT (BATCH POST) ---
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
          // CSV Parser sederhana
          const lines = text.split(/\r?\n/).filter(Boolean);
          const headers = (lines.shift() || "").split(",").map(v => v.trim());
          parsed = lines.map(line => {
            const cells = line.match(/(?:"([^"]*)")|([^,]+)/g)?.map(x => x.replace(/^"|"$/g, "")) || [];
            return Object.fromEntries(headers.map((h, i) => [h, cells[i] || ""]));
          });
        }

        // Simpan setiap item ke DB melalui Promise.all agar cepat
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

  // --- FUNGSI EXPORT ---
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
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">Heriyati Wedding</p>
          <h1 className="display-font">Admin Dashboard</h1>
        </div>
        <div className="admin-actions">
          <LogoutButton />
        </div>
      </header>

      {message && <div className="admin-toast">{message}</div>}

      <section className="admin-stat-grid">
        <div className="admin-stat">
          <PackagePlus size={20} />
          <div><span>Total Produk</span><strong>{products.length}</strong></div>
        </div>
        <div className="admin-stat">
          <BarChart3 size={20} />
          <div><span>Estimasi Nilai Daftar</span><strong>{toRupiah(totalValue)}</strong></div>
        </div>
        <div className="admin-stat">
          <FileJson size={20} />
          <div><span>Format Import</span><strong>JSON / CSV</strong></div>
        </div>
      </section>

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

            <label className="block mb-4">
              Foto produk <span className="admin-help">akan diupload ke CDN (Bisa pilih banyak)</span>

              <div className="block mb-4">
                <span className="block font-medium mb-1">
                  Foto produk <span className="admin-help">akan diupload ke CDN (Bisa pilih banyak)</span>
                </span>

                {/* 1. Preview Gambar Tersimpan (Dari Database) */}
                {form.image && form.image.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-3">
                    {form.image.map((imgUrl: string, index: number) => (
                      <div key={`saved-${index}`} className="relative w-24 h-24 group">
                        <img
                          src={imgUrl}
                          alt={`Tersimpan ${index + 1}`}
                          className="w-full h-full object-cover rounded-md border border-gray-300"
                        />
                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => removeSavedImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                          title="Hapus gambar ini"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Preview File Baru (Sebelum Diupload) */}
                {imageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-3">
                    {imageFiles.map((file: File, index: number) => (
                      <div key={`new-${index}`} className="relative w-24 h-24 group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Baru ${index + 1}`}
                          className="w-full h-full object-cover rounded-md border-2 border-blue-500"
                        />
                        <span className="absolute bottom-0 left-0 w-full bg-blue-500/80 text-white text-[10px] py-0.5 text-center rounded-b-sm">
                          Baru
                        </span>
                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                          title="Batal upload gambar ini"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Area Upload Dropzone (Dibungkus label agar input file bisa diklik) */}
                <label className="admin-upload-box mt-2 cursor-pointer block">
                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                    <ImagePlus size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Klik untuk menambah gambar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden" // Sembunyikan input asli
                      onChange={e => {
                        if (e.target.files) {
                          // Gabungkan file yang sudah dipilih sebelumnya dengan file yang baru dipilih
                          setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                        }
                        // Reset value input agar file yang sama bisa dipilih lagi jika baru saja dihapus
                        e.target.value = '';
                      }}
                      disabled={isUploading}
                    />
                  </div>
                </label>
              </div>
            </label>

            <button className="admin-primary-button" type="submit" disabled={isUploading}>
              {isUploading ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {isUploading
                ? "Menyimpan Data..."
                : editId ? "Simpan Perubahan" : "Tambah ke Katalog"}
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
                <input
                  type="file"
                  accept=".json,.csv,application/json,text/csv"
                  onChange={handleImport}
                  disabled={isUploading}
                />
              </label>
              <button className="admin-ghost-button" onClick={exportJson} disabled={isUploading}>
                <Download size={15} /> Export
              </button>
            </div>
          </div>

          <input
            className="admin-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari produk..."
            disabled={isUploading || isLoadingData}
          />

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
                      <p style={{ marginTop: "0.5rem" }}>Memuat database...</p>
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
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
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
                      <td>
                        <span className="admin-category-badge">{product.category}</span>
                      </td>
                      <td>{toRupiah(product.price)}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-icon-button"
                            onClick={() => edit(product)}
                            aria-label={`Edit ${product.name}`}
                            disabled={isUploading}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="admin-icon-button danger"
                            onClick={() => remove(product.id)}
                            aria-label={`Hapus ${product.name}`}
                            disabled={isUploading}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-tools">
            <button
              className="admin-ghost-button"
              onClick={fetchProducts}
              disabled={isUploading || isLoadingData}
            >
              Refresh Data dari Database
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}