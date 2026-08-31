"use client";

import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        setIsLoading(true);
        try {
            // Memanggil API route untuk menghapus HTTP-Only Cookie
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                router.push("/admin/login");
                router.refresh();
            }
        } catch (error) {
            console.error("Gagal melakukan logout:", error);
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className=" admin-ghost-button flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            <span>{isLoading ? "Keluar..." : "Logout"}</span>
        </button>
    );
}