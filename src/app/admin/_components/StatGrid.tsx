import { BarChart3, FileJson, PackagePlus } from "lucide-react";
import { toRupiah } from "@/src/lib/constants";

interface StatGridProps {
    totalProducts: number;
    totalValue: number;
}

export default function StatGrid({ totalProducts, totalValue }: StatGridProps) {
    return (
        <section className="admin-stat-grid">
            <div className="admin-stat">
                <PackagePlus size={20} />
                <div>
                    <span>Total Produk</span>
                    <strong>{totalProducts}</strong>
                </div>
            </div>
            <div className="admin-stat">
                <BarChart3 size={20} />
                <div>
                    <span>Estimasi Nilai Daftar</span>
                    <strong>{toRupiah(totalValue)}</strong>
                </div>
            </div>
            <div className="admin-stat">
                <FileJson size={20} />
                <div>
                    <span>Format Import</span>
                    <strong>JSON / CSV</strong>
                </div>
            </div>
        </section>
    );
}