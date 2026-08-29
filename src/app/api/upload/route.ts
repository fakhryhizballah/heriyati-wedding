import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = process.env.CDN_UPLOAD_TOKEN;
  const url = process.env.CDN_UPLOAD_URL;
  if (!token || !url) {
    return NextResponse.json({ status: false, message: "CDN_UPLOAD_TOKEN belum dikonfigurasi." }, { status: 500 });
  }

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ status: false, message: "Field file wajib diisi." }, { status: 400 });
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok) {
      return NextResponse.json({ status: false, message: "Upload CDN gagal.", detail: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      status: false,
      message: error instanceof Error ? error.message : "Upload gagal.",
    }, { status: 500 });
  }
}