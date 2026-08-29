"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { COLOR } from "@/src/lib/constants";

export function StitchDivider({ color = COLOR.brass }: { color?: string }) {
  return <div className="stitch-divider" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} 6px, transparent 6px, transparent 11px)` }} />;
}

export function Pill({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent: string }) {
  return <button className="pill" onClick={onClick} style={{ borderColor: active ? accent : COLOR.line, backgroundColor: active ? accent : "transparent", color: active ? COLOR.paper : COLOR.inkSoft }}>{label}</button>;
}

export function HeartButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [bump, setBump] = useState(false);
  return <button className="heart-button" onClick={(e) => { e.stopPropagation(); onClick(); setBump(true); window.setTimeout(() => setBump(false), 260); }} aria-label="wishlist" style={{ transform: bump ? "scale(1.25)" : "scale(1)" }}><Heart size={16} strokeWidth={2} color={active ? COLOR.maroon : COLOR.inkSoft} fill={active ? COLOR.maroon : "none"} /></button>;
}
