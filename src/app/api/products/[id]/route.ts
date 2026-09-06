import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ProductModel from "@/src/models/Product"; 
import dbConnect from "@/src/lib/mongodb"; 
// interface RouteParams {
//   params: { id: string };
// }
type RouteParams = { params: Promise<{ id: string }> };
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await dbConnect();
    const product = await ProductModel.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Error sistem", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await dbConnect();
   const { id } = await params; 
    const body = await req.json();

    // 2. Keamanan: Mencegah Mass Assignment
    // Hapus field yang tidak boleh diubah oleh user secara langsung
    const { _id, createdAt, updatedAt, ...safeUpdateData } = body;

    // 3. Gunakan operator $set secara eksplisit untuk update parsial yang aman
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: safeUpdateData },
      { 
        new: true, 
        runValidators: true,
        lean: true // Opsional: Tambahkan lean() jika hanya butuh plain object untuk response (lebih ringan)
      } 
    );
    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Produk berhasil diupdate", data: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params; 
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Produk berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus produk", error: error.message },
      { status: 500 }
    );
  }
}