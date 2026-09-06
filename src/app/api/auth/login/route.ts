import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // TODO: Ganti dengan query validasi database (misal: Prisma/Mongoose)
    if (username === 'admin' && password === 'admin8899') {
      
      // Generate JWT
      const token = await new SignJWT({ username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h') // Token berlaku 8 jam
        .sign(SECRET_KEY);

      const response = NextResponse.json(
        { success: true, message: 'Login berhasil' },
        { status: 200 }
      );

      // Set cookie dengan HttpOnly untuk keamanan (anti-XSS)
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 jam dalam detik
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Username atau password tidak sesuai.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}