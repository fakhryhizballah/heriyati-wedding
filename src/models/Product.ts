import mongoose, { Schema, Document, Model } from "mongoose";

// ==========================================
// 1. Definisikan Data/Konstanta Asli Anda
// ==========================================
export const COLOR = {
  maroon: "#800000",
  brass: "#B5A642",
  blush: "#DE5D83",
} as const;

export const CATEGORY_ACCENT = {
  "Baju Adat": COLOR.maroon,
  Seragam: COLOR.brass,
  Makeup: COLOR.blush,
} as const;

// export const ALL_TAGS = ["#Premium", "#Jawa", "#Sunda", "#Minimalist", "#Promo"] as const;
export const CATEGORIES = ["Semua", "Baju Adat", "Seragam", "Makeup"] as const;
export const WA_PHONE = "6281234567890";

// ==========================================
// 2. Tipe Data TypeScript
// ==========================================
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
  image: string[];
};

export type CartItem = Product & {
  color: string;
  size: string;
  qty: number;
};

export interface IProductDocument extends Omit<Product, "id">, Document {}

// ==========================================
// 3. Mongoose Schema
// ==========================================
const ProductSchema = new Schema<IProductDocument>(
  {
    name: { 
      type: String, 
      required: [true, "Nama produk wajib diisi"], 
      trim: true 
    },
    category: { 
      type: String, 
      required: [true, "Kategori wajib diisi"],
      enum: {
        values: Object.keys(CATEGORY_ACCENT),
        message: "{VALUE} bukan kategori yang valid"
      }
    },
    price: { 
      type: Number, 
      required: [true, "Harga wajib diisi"],
      min: [0, "Harga tidak boleh minus"]
    },
    tags: { 
      type: [String], 
    //   enum: {
    //     values: [...ALL_TAGS], // Membatasi input array tags sesuai dengan konstanta ALL_TAGS
    //     message: "{VALUE} bukan tag yang valid"
    //   },
      default: [] 
    },
    desc: { 
      type: String, 
      default: "" 
    },
    colors: { 
      type: [String], 
      default: [] 
    },
    sizes: { 
      type: [String], 
      default: [] 
    },
    seed: { 
      type: Number, 
      default: 0 
    },
    image: { 
      type: [String], 
      default: [] 
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, // Memastikan virtual properties (jika ada) ikut ter-render
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==========================================
// 4. Export Model (Pencegahan Duplikasi Next.js HMR)
// ==========================================
// Penambahan explicit typing <Model<IProductDocument>> untuk mencegah error TS pada mongoose.models
const ProductModel = (mongoose.models.Product as Model<IProductDocument>) || 
                     mongoose.model<IProductDocument>("Product", ProductSchema);

export default ProductModel;