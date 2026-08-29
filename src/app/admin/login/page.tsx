"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLOR } from "@/src/lib/constants";
import { isAdminLoggedIn, setAdminLoggedIn } from "@/src/lib/admin-storage";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminLoggedIn()) router.replace("/admin");
  }, [router]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setAdminLoggedIn(true);
      router.replace("/admin");
      return;
    }
    setError("Username atau password tidak sesuai.");
  }

  return (
    <main className="admin-auth-shell">
      <div className="admin-auth-card">
        <Link href="/" className="admin-back-link"><ArrowLeft size={16} /> Kembali ke katalog</Link>
        <div className="admin-brand-mark"><LockKeyhole size={24} /></div>
        <p className="admin-kicker">Heriyati Wedding</p>
        <h1 className="display-font admin-auth-title">Login Admin</h1>
        <p className="admin-muted">Kelola katalog busana dan layanan makeup dari panel admin.</p>
        <form onSubmit={submit} className="admin-form">
          <label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required placeholder="admin" /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••" /></label>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-primary-button" type="submit"><LogIn size={17} /> Masuk ke Admin</button>
        </form>
        <div className="admin-demo-note">Demo lokal: <b>admin</b> / <b>admin123</b></div>
      </div>
    </main>
  );
}
