"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { COLOR } from "@/src/lib/constants";

export default function ProfileView() {
  return <div style={{ padding: "16px 16px 112px" }}><h1 className="display-font" style={{ margin: "0 0 16px", fontSize: 22 }}>Profil</h1><div style={{ padding: 20, borderRadius: 16, textAlign: "center", background: COLOR.paper, border: `1px solid ${COLOR.line}` }}><div style={{ width: 56, height: 56, borderRadius: 999, margin: "0 auto 12px", display: "grid", placeItems: "center", background: COLOR.ivory }}><User size={22} color={COLOR.inkSoft} /></div><p className="body-font" style={{ margin: 0, fontWeight: 700 }}>Belum masuk</p><p className="body-font" style={{ margin: "4px 0 16px", fontSize: 12, lineHeight: 1.6, color: COLOR.inkSoft }}>Masuk untuk menyimpan wishlist dan melihat riwayat pesanan. Kamu tetap bisa checkout sebagai tamu.</p><button style={{ width: "100%", padding: 12, border: 0, borderRadius: 999, marginBottom: 8, background: COLOR.ink, color: COLOR.paper, fontWeight: 700 }}>Masuk dengan Google</button><Link href="/admin/login" style={{ display: "block", width: "100%", padding: 12, borderRadius: 999, background: "transparent", border: `1px solid ${COLOR.line}`, color: COLOR.inkSoft, fontWeight: 700, textDecoration: "none" }}>Masuk sebagai Admin</Link></div><p className="body-font" style={{ margin: "16px 0 0", textAlign: "center", fontSize: 11, color: COLOR.inkSoft }}>Login Google &amp; Admin akan aktif penuh di Fase 2–3 sesuai roadmap.</p></div>;
}
