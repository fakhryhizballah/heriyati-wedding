"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { COLOR } from "@/src/lib/constants";

const STORAGE_KEY = "heriyati-wedding-heart-liked";

export default function WeddingHeart() {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bump, setBump] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === "true") {
            setLiked(true);
        }

        const loadCount = async () => {
            try {
                const response = await fetch("/api/heart", {
                    method: "GET",
                    cache: "no-store",
                });

                const result = await response.json();

                if (result.success) {
                    setCount(result.data.count);
                }
            } catch (error) {
                console.error("Gagal mengambil count heart:", error);
            } finally {
                setLoading(false);
            }
        };

        void loadCount();
    }, []);

    const handleHeart = async () => {
        if (liked || loading) {
            return;
        }

        // Lock lebih dulu agar double click tidak membuat 2 request.
        localStorage.setItem(STORAGE_KEY, "true");
        setLiked(true);
        setBump(true);

        window.setTimeout(() => {
            setBump(false);
        }, 260);

        try {
            const response = await fetch("/api/heart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gagal menambah heart");
            }

            setCount(result.data.count);
        } catch (error) {
            console.error("Gagal menambahkan heart:", error);

            // Rollback kalau API gagal.
            localStorage.removeItem(STORAGE_KEY);
            setLiked(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
            }}
        >
            <button
                type="button"
                onClick={() => void handleHeart()}
                disabled={liked || loading}
                aria-label={liked ? "Sudah memberikan cinta" : "Berikan cinta"}
                style={{
                    border: "none",
                    background: "transparent",
                    padding: 8,
                    cursor: liked || loading ? "default" : "pointer",
                    transform: bump ? "scale(1.25)" : "scale(1)",
                    transition: "transform 160ms ease",
                }}
            >
                <Heart
                    size={28}
                    strokeWidth={2}
                    color={liked ? COLOR.maroon : COLOR.inkSoft}
                    fill={liked ? COLOR.maroon : "none"}
                />
            </button>

            <span
                className="display-font"
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: COLOR.ink,
                }}
            >
                {loading ? "..." : count.toLocaleString("id-ID")}
            </span>
        </div>
    );
}