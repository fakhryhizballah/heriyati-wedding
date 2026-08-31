import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Amankan route yang diawali /admin (kecuali halaman login admin itu sendiri)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verifikasi token. Jika gagal/expired akan masuk ke catch block
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      // Token invalid/expired, hapus cookie dan arahkan ke login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 2. Cegah user yang sudah login mengakses halaman login lagi
  if (pathname === '/admin/login' && token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.redirect(new URL('/admin', request.url));
    } catch (error) {
      // Jika token usang di halaman login, biarkan berlanjut (NextResponse.next)
    }
  }

  return NextResponse.next();
}

// Tentukan path mana saja yang dicegat middleware
export const config = {
  matcher: ['/admin/:path*'],
};