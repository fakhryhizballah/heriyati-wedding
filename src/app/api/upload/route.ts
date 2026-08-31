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
    
    // Gunakan getAll() untuk mengambil array dari files
    // Pastikan string "files" sesuai dengan key yang Anda gunakan di formData frontend
    const files = incoming.getAll("files"); 
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: false, message: "Tidak ada file yang diunggah." }, 
        { status: 400 }
      );
    }
  
    const formDataToCDN = new FormData();

    // Loop semua file dan validasi
    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { status: false, message: "Salah satu data yang dikirim bukan file yang valid." }, 
          { status: 400 }
        );
      }
      
      // Append ke form data CDN. 
      // CATATAN: Sesuaikan key "files" di bawah dengan apa yang diminta oleh API CDN Anda.
      // Beberapa CDN mungkin meminta key "file", "files[]", atau "files".
      formDataToCDN.append("file", file, file.name);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: token },
      body: formDataToCDN,
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown = null;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { raw: text }; 
    }

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: "Upload CDN gagal.", detail: data }, 
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Upload gagal.",
      }, 
      { status: 500 }
    );
  }
}