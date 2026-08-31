import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ProductModel from "@/src/models/Product"; 
import dbConnect from "@/src/lib/mongodb"; 

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Fitur tambahan: baca query param untuk filter category (opsional)
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    
    const filter = category && category !== "Semua" ? { category } : {};
    const products = await ProductModel.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const newProduct = await ProductModel.create(body);

    return NextResponse.json(
      { success: true, message: "Produk berhasil ditambahkan", data: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    // Menangani error validasi Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid", error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk", error: error.message },
      { status: 500 }
    );
  }
}