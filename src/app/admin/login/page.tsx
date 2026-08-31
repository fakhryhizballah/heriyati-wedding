"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // useEffect untuk mengecek status login tidak diperlukan lagi
  // karena middleware sudah memblokir akses secara otomatis.

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Token tersimpan di HttpOnly Cookie, langsung arahkan ke admin
        router.push("/admin");
        router.refresh(); // Memaksa layout merender ulang state dari server
      } else {
        const data = await res.json();
        setError(data.error || "Terjadi kesalahan saat login.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="admin-auth-shell">
      <div className="admin-auth-card">
        <Link href="/" className="admin-back-link">
          <ArrowLeft size={16} /> Kembali ke katalog
        </Link>
        <div className="admin-brand-mark"><LockKeyhole size={24} /></div>
        <p className="admin-kicker">Heriyati Wedding</p>
        <h1 className="display-font admin-auth-title">Login Admin</h1>
        <p className="admin-muted">Kelola katalog busana dan layanan makeup dari panel admin.</p>

        <form onSubmit={submit} className="admin-form">
          <label>
            Username
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="admin"
              disabled={isLoading}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </label>

          {error && <p className="admin-error text-red-500 text-sm mt-1">{error}</p>}

          <button
            className="admin-primary-button flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
            {isLoading ? "Memproses..." : "Masuk ke Admin"}
          </button>
        </form>
        <div className="admin-demo-note mt-4 text-sm text-gray-500">
          Demo lokal: <b>admin</b> / <b>admin123</b>
        </div>
      </div>
    </main>
  );
}