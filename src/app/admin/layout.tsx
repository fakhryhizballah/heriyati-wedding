import { ReactNode } from "react";
import LogoutButton from "@/src/components/LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
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

            {/* Konten dari page.tsx akan masuk ke sini */}
            {children}
        </main>
    );
}