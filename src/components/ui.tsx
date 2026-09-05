"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { COLOR } from "@/src/lib/constants";

export function StitchDivider({
  color = COLOR.brass,
}: {
  color?: string;
}) {
  return (
    <div
      className="stitch-divider"
      style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          ${color} 0,
          ${color} 6px,
          transparent 6px,
          transparent 11px
        )`,
      }}
    />
  );
}

export function Pill({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      className="pill"
      onClick={onClick}
      style={{
        borderColor: active ? accent : COLOR.line,
        backgroundColor: active ? accent : "transparent",
        color: active ? COLOR.paper : COLOR.inkSoft,
      }}
    >
      {label}
    </button>
  );
}

export function HeartButton({
  active,
  count = 0,
  onClick,
}: {
  active: boolean;
    count?: number;
  onClick: () => void;
}) {
  const [bump, setBump] = useState(false);

  const handleClick = () => {
    setBump(true);
    onClick();

    window.setTimeout(() => {
      setBump(false);
    }, 260);
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <button
        type="button"
        className="heart-button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        aria-label={active ? "Batalkan heart" : "Beri heart"}
        style={{
          transform: bump ? "scale(1.25)" : "scale(1)",
          opacity: active ? 1 : 0.9,
          cursor: "pointer",
        }}
      >
        <Heart
          size={18}
          strokeWidth={2}
          color={active ? COLOR.maroon : COLOR.inkSoft}
          fill={active ? COLOR.maroon : "none"}
        />
      </button>

      <span
        className="body-font"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: COLOR.inkSoft,
          minWidth: 20,
        }}
      >
        {count.toLocaleString("id-ID")}
      </span>
    </div>
  );
}