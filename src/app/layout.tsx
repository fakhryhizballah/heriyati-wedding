import type { Metadata } from "next";
import "./globals.css";
import { ProductCatalogProvider } from "@/src/components/ProductCatalogProvider";

export const metadata: Metadata = {
  title: "Heriyati Wedding",
  description: "Sewa busana & makeup pengantin",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><ProductCatalogProvider>{children}</ProductCatalogProvider></body>
    </html>
  );
}
