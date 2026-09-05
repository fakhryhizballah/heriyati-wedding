import mongoose, { Schema, Document, Model } from "mongoose";

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
    tags: { 
      type: [String], 
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