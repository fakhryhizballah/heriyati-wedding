// 1. Tambahkan import untuk tipe Product dari lokasi file Anda
// Misalnya: import { Product } from "@/types";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  tags?: string[];
  desc?: string;
  colors?: string[];
  sizes?: string[];
  seed?: number;
  image?: string[];
}

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
    },
    price: { 
      type: Number, 
      required: [true, "Harga wajib diisi"],
      min: [0, "Harga tidak boleh minus"]
    },
    tags: { type: [String], default: [] },
    desc: { type: String, default: "" },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    seed: { type: Number, default: 0 },
    image: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Tambahkan (ret as any) saat mendefinisikan .id
        (ret as any).id = ret._id.toString();
        
        delete (ret as any)._id;
        delete (ret as any).__v;
        
        return ret;
      },
    },
  }
);

// ==========================================
// 4. Export Model
// ==========================================
const ProductModel = (mongoose.models.Product as Model<IProductDocument>) || 
                     mongoose.model<IProductDocument>("Product", ProductSchema);

export default ProductModel;