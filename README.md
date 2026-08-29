# Heriyati Wedding — Next.js

Konversi dari single-file React prototype menjadi project Next.js App Router dengan TypeScript.

## Struktur

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  BottomNav.tsx
  CartView.tsx
  HomeView.tsx
  ProductCard.tsx
  ProductSheet.tsx
  ProfileView.tsx
  ui.tsx
lib/
  constants.ts
```

## Jalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Catatan

- Data produk tetap mock data dari source awal.
- Nomor WhatsApp masih placeholder `6281234567890`; ganti di `lib/constants.ts`.
- Login Google/Admin masih berupa placeholder, sama seperti source awal.
- Visual produk tetap menggunakan woven CSS pattern seperti prototype, belum memakai gambar produk nyata.
