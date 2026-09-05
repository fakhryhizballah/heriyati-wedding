import { NextResponse } from "next/server";
import dbConnect from "@/src/lib/mongodb";
import HeartModel from "@/src/models/Heart";

export async function GET(
  request: Request
) {
  try {
    await dbConnect();

    const { searchParams } =
      new URL(request.url);

    const productId =
      searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "productId wajib diisi",
        },
        { status: 400 }
      );
    }

    const count = await HeartModel.countDocuments({
      productId,
    });

    return NextResponse.json({
      success: true,
      data: {
        productId,
        count,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/heart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil jumlah heart",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    await dbConnect();

    const body = await request.json();

    const visitorId = body?.visitorId;
    const productId = body?.productId;

    if (
      typeof visitorId !== "string" ||
      !visitorId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "visitorId wajib diisi",
        },
        { status: 400 }
      );
    }

    if (
      typeof productId !== "string" ||
      !productId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "productId wajib diisi",
        },
        { status: 400 }
      );
    }

    const normalizedVisitorId =
      visitorId.trim();

    const normalizedProductId =
      productId.trim();

    const existing =
      await HeartModel.findOne({
        visitorId: normalizedVisitorId,
        productId: normalizedProductId,
      });

    if (existing) {
      // already liked
     await HeartModel.deleteOne({
        visitorId: normalizedVisitorId,
        productId: normalizedProductId,
      });
      const count =
        await HeartModel.countDocuments({
          productId: normalizedProductId,
        });

      return NextResponse.json({
        success: true,
        alreadyLiked: true,
        data: {
          productId:
            normalizedProductId,
          count,
        },
      });
    }

    await HeartModel.create({
      visitorId: normalizedVisitorId,
      productId: normalizedProductId,
    });

    const count =
      await HeartModel.countDocuments({
        productId:
          normalizedProductId,
      });

    return NextResponse.json({
      success: true,
      alreadyLiked: false,
      data: {
        productId:
          normalizedProductId,
        count,
      },
    });
  } catch (error: any) {
    // Handle duplicate unique index
    // jika dua request masuk bersamaan.
    if (error?.code === 11000) {
      return NextResponse.json({
        success: true,
        alreadyLiked: true,
      });
    }

    console.error(
      "POST /api/heart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan heart",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request
) {
  try {
    await dbConnect();

    const body = await request.json();

    const visitorId =
      body?.visitorId;

    const productId =
      body?.productId;

    if (!visitorId || !productId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "visitorId dan productId wajib diisi",
        },
        { status: 400 }
      );
    }

    await HeartModel.deleteOne({
      visitorId,
      productId,
    });

    const count =
      await HeartModel.countDocuments({
        productId,
      });

    return NextResponse.json({
      success: true,
      message:
        "Heart berhasil dihapus",
      data: {
        productId,
        count,
      },
    });
  } catch (error) {
    console.error(
      "DELETE /api/heart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menghapus heart",
      },
      { status: 500 }
    );
  }
}