"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3, FileJson, ImagePlus, LogOut, PackagePlus,
  Pencil, Save, Trash2, Upload, X, Download, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ALL_TAGS, CATEGORIES, Category, Product, toRupiah } from "@/src/lib/constants";
import { isAdminLoggedIn, setAdminLoggedIn } from "@/src/lib/admin-storage";
import { useProductCatalog } from "@/src/components/ProductCatalogProvider";

// Mendefinisikan nilai kosong untuk form, ditambah field 'image'
const EMPTY = {
  name: "",
  category: "Baju Adat" as Category,
  price: 0,
  tags: [] as string[],
  desc: "",
  colors: [] as string[],
  sizes: [] as string[],
  image: "" // Field baru untuk menampung URL gambar
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(raw: any, index: number): Product | null {
  if (!raw?.name || !raw?.category) return null;
  const category: Category = ["Baju Adat", "Seragam", "Makeup"].includes(raw.category)
    ? raw.category
    : "Baju Adat";

  return {
    id: String(raw.id || `p-${Date.now()}-${index}`),
    seed: Number(raw.seed || Date.now() + index),
    name: String(raw.name),
    category,
    price: Number(raw.price || 0),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    desc: String(raw.desc || ""),
    colors: Array.isArray(raw.colors) ? raw.colors.map(String) : [],
    sizes: Array.isArray(raw.sizes) ? raw.sizes.map(String) : [],
    image: String(raw.image || ""),
  } as Product;
}

function splitList(value: string) {
  return value.split(",").map(s => s.trim()).filter(Boolean);
}

export default function AdminPage() {
  const router = useRouter();
  const { products, setProducts, resetProducts } = useProductCatalog();

  // States
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  // States untuk Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mencegah Hydration Mismatch & Cek Auth
  useEffect(() => {
    setIsMounted(true);
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login");
    }
  }, [router]);

  // Fitur Pencarian
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
    setImageFile(null);
  }

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2400);
  }

  // --- FUNGSI SUBMIT DENGAN UPLOAD ---
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.desc.trim() || form.price <= 0) {
      notify("Lengkapi nama, deskripsi, dan harga.");
      return;
    }

    setIsUploading(true);
    let finalImageUrl = form.image; // Jika sedang edit dan tidak ganti gambar, gunakan URL lama

    // 1. Eksekusi Upload API jika ada file baru yang dipilih
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);

        // Memanggil route handler yang Anda buat (pastikan path-nya sesuai)
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal upload gambar ke CDN.");
        }

        // Sesuaikan 'data.url' dengan response dari CDN/API Route Anda
        finalImageUrl = data.url || data.file_url || data.data?.url || "";
      } catch (err) {
        notify(err instanceof Error ? err.message : "Terjadi kesalahan saat upload.");
        setIsUploading(false);
        return; // Hentikan proses simpan jika upload gambar gagal
      }
    }

    // 2. Simpan Data Produk ke State/Katalog
    const product = {
      ...form,
      image: finalImageUrl,
      id: editId || `p-${Date.now()}`,
      seed: editId
        ? (products.find(p => p.id === editId)?.seed || Date.now())
        : Date.now()
    } as Product;

    setProducts(editId
      ? products.map(p => p.id === editId ? product : p)
      : [product, ...products]
    );

    notify(editId ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
    resetForm();
    setIsUploading(false);
  }

  // --- FUNGSI EDIT ---
  function edit(product: Product) {
    setEditId(product.id);
    setImageFile(null); // Kosongkan file input agar tidak menimpa gambar tanpa disengaja
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      tags: product.tags,
      desc: product.desc,
      colors: product.colors,
      sizes: product.sizes,
      // @ts-ignore (Jika image belum di-define di interface Product utama)
      image: product.image || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(id: string) {
    if (!window.confirm("Hapus produk ini dari katalog?")) return;
    setProducts(products.filter(p => p.id !== id));
    notify("Produk dihapus.");
    if (editId === id) resetForm();
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let parsed: any[];

        if (file.name.toLowerCase().endsWith(".json")) {
          const json = JSON.parse(text);
          parsed = Array.isArray(json) ? json : (Array.isArray(json.products) ? json.products : []);
        } else {
          const lines = text.split(/\r?\n/).filter(Boolean);
          const headers = (lines.shift() || "").split(",").map(v => v.trim());
          parsed = lines.map(line => {
            const cells = line.match(/(?:"([^"]*)")|([^,]+)/g)?.map(x => x.replace(/^"|"$/g, "")) || [];
            return Object.fromEntries(headers.map((h, i) => [h, cells[i] || ""]));
          });
          parsed = parsed.map(p => ({
            ...p,
            tags: splitList(p.tags || ""),
            colors: splitList(p.colors || ""),
            sizes: splitList(p.sizes || "")
          }));
        }

        const imported = parsed.map(normalizeProduct).filter(Boolean) as Product[];
        if (!imported.length) throw new Error("Tidak ada data valid.");

        setProducts(imported);
        notify(`${imported.length} produk berhasil diimpor.`);
      } catch (err) {
        notify(err instanceof Error ? `Import gagal: ${err.message}` : "Import gagal.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "heriyati-products.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function logout() {
    setAdminLoggedIn(false);
    router.replace("/admin/login");
  }

  // Mencegah error render di server-side saat mengakses localStorage
  if (!isMounted || !isAdminLoggedIn()) return null;

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">Heriyati Wedding</p>
          <h1 className="display-font">Admin Dashboard</h1>
        </div>
        <div className="admin-actions">
          <button className="admin-ghost-button" onClick={logout}>
            <LogOut size={16} /> Keluar
          </button>
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
            <label>
              Nama produk
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Kebaya Sunda Ratri"
                disabled={isUploading}
              />
            </label>

            <div className="admin-two-col">
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
              <label>
                Harga
                <input
                  type="number"
                  min={0}
                  value={form.price || ""}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="850000"
                  disabled={isUploading}
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

            <label>
              Foto produk <span className="admin-help">akan diupload ke CDN</span>
              <div className="admin-upload-box">
                <ImagePlus size={20} />
                <span>
                  {imageFile
                    ? imageFile.name
                    : form.image
                      ? "Gambar tersimpan (Pilih file baru untuk mengganti)"
                      : "Pilih file gambar"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                />
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
            disabled={isUploading}
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
                {filtered.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Menampilkan thumbnail kecil jika ada gambarnya */}
                        {/* @ts-ignore */}
                        {product.image ? (
                          // @ts-ignore
                          <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImagePlus size={16} color="#aaa" />
                          </div>
                        )}
                        <div>
                          <strong>{product.name}</strong>
                          <small style={{ display: 'block' }}>{product.tags.join(" · ") || "Tanpa tag"}</small>
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-tools">
            <button
              className="admin-ghost-button"
              onClick={() => {
                if (window.confirm("Kembalikan produk ke data awal?")) resetProducts();
              }}
              disabled={isUploading}
            >
              Reset ke Data Awal
            </button>
          </div>
        </section>
      </div>

      <div className="admin-import-help">
        <b>Format JSON:</b> array produk dengan field <code>name</code>, <code>category</code>,
        <code>price</code>, <code>tags</code>, <code>desc</code>, <code>colors</code>, <code>sizes</code>,
        dan <code>image</code> (opsional). CSV memakai header yang sama; field array dipisahkan koma.
      </div>
    </main>
  );
}