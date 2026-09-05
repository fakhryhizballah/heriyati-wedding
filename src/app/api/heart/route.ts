import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/mongodb";
import HeartModel from "@/src/models/Heart";

const HEART_KEY = "wedding";

export async function GET() {
  try {
    await dbConnect();

    const heart = await HeartModel.findOne({ key: HEART_KEY }).lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          count: heart?.count ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil jumlah heart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await dbConnect();

    const heart = await HeartModel.findOneAndUpdate(
      { key: HEART_KEY },
      {
        $inc: {
          count: 1,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Heart berhasil ditambahkan",
        data: {
          count: heart.count,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan heart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}