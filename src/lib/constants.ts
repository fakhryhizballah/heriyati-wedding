export const COLOR = {
  ink: "#1C1811",
  inkSoft: "#5B5646",
  ivory: "#F5F0E4",
  paper: "#FBF8F1",
  line: "#E1D8C2",
  brass: "#B2863C",
  brassSoft: "#DCC490",
  maroon: "#6E1F26",
  maroonSoft: "#C98A8F",
  blush: "#C98B86",
  blushSoft: "#EBCFC7",
  sage: "#5C6B4E",
} as const;

export const CATEGORY_ACCENT = {
  "Baju Adat": COLOR.maroon,
  Seragam: COLOR.brass,
  Makeup: COLOR.blush,
} as const;

export const ALL_TAGS = ["#Premium", "#Jawa", "#Sunda", "#Minimalist", "#Promo"] as const;
export const CATEGORIES = ["Semua", "Baju Adat", "Seragam", "Makeup"] as const;
export const WA_PHONE = "6281234567890";

export type Category = keyof typeof CATEGORY_ACCENT;

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  tags: string[];
  desc: string;
  colors: string[];
  sizes: string[];
  seed: number;
};

export type CartItem = Product & {
  color: string;
  size: string;
  qty: number;
};

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Kebaya Sunda Ratri",
    category: "Baju Adat",
    price: 850000,
    tags: ["#Sunda", "#Premium"],
    desc: "Kebaya encim modifikasi dengan bordir tangan, dipadukan kain batik motif mega mendung. Cocok untuk akad maupun resepsi.",
    colors: ["Ivory", "Maroon", "Sage"],
    sizes: ["S", "M", "L", "XL"],
    seed: 1,
  },
  {
    id: "p2",
    name: "Beskap Jawa Kalim",
    category: "Baju Adat",
    price: 750000,
    tags: ["#Jawa", "#Minimalist"],
    desc: "Beskap katun premium dengan kancing kuningan, dilengkapi blangkon dan keris tiruan. Potongan slim modern.",
    colors: ["Hitam", "Maroon"],
    sizes: ["M", "L", "XL", "XXL"],
    seed: 2,
  },
  {
    id: "p3",
    name: "Seragam Bridesmaid Alira",
    category: "Seragam",
    price: 425000,
    tags: ["#Minimalist", "#Promo"],
    desc: "Dress satin jatuh dengan potongan A-line, tersedia banyak ukuran untuk kebutuhan seragam keluarga dalam jumlah besar.",
    colors: ["Dusty Pink", "Sage", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL"],
    seed: 3,
  },
  {
    id: "p4",
    name: "Setelan Keluarga Wira",
    category: "Seragam",
    price: 380000,
    tags: ["#Promo"],
    desc: "Kemeja batik cap untuk seragam keluarga besar, bahan adem dan tidak mudah kusut, cocok dipakai seharian acara.",
    colors: ["Navy", "Maroon"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    seed: 4,
  },
  {
    id: "p5",
    name: "Makeup Akad Sarasvati",
    category: "Makeup",
    price: 1250000,
    tags: ["#Premium"],
    desc: "Riasan pengantin natural glowing untuk sesi akad, termasuk trial makeup dan penataan sanggul modern.",
    colors: ["Natural", "Soft Glam"],
    sizes: ["Sesi Pagi", "Sesi Siang"],
    seed: 5,
  },
  {
    id: "p6",
    name: "Makeup Resepsi Kirana",
    category: "Makeup",
    price: 1650000,
    tags: ["#Premium", "#Jawa"],
    desc: "Riasan bold tahan lama untuk resepsi, termasuk touch-up on-site dan penataan rambut sesuai tema pesta.",
    colors: ["Bold Glam", "Korean Glow"],
    sizes: ["Sesi Siang", "Sesi Malam"],
    seed: 6,
  },
  {
    id: "p7",
    name: "Kebaya Bali Saraswati",
    category: "Baju Adat",
    price: 900000,
    tags: ["#Premium"],
    desc: "Kebaya brokat dengan songket asli tenun tangan, detail payet halus di bagian dada dan lengan.",
    colors: ["Gold", "Ivory"],
    sizes: ["S", "M", "L"],
    seed: 7,
  },
  {
    id: "p8",
    name: "Seragam Groomsmen Danu",
    category: "Seragam",
    price: 400000,
    tags: ["#Minimalist"],
    desc: "Kemeja lengan panjang dengan saku dada, motif garis halus, nyaman dipakai untuk acara outdoor maupun indoor.",
    colors: ["Putih", "Navy"],
    sizes: ["M", "L", "XL"],
    seed: 8,
  },
];

export function toRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export function wovenPattern(accent: string, seed: number): React.CSSProperties {
  const angle = 35 + (seed % 4) * 15;
  return {
    backgroundColor: COLOR.paper,
    backgroundImage: [
      `repeating-linear-gradient(${angle}deg, ${accent}22 0px, ${accent}22 2px, transparent 2px, transparent 14px)`,
      `repeating-linear-gradient(${angle + 90}deg, ${accent}14 0px, ${accent}14 1px, transparent 1px, transparent 10px)`,
      `linear-gradient(160deg, ${accent}18, transparent 70%)`,
    ].join(", "),
  };
}
