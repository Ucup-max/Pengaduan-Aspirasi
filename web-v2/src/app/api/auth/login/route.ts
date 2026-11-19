import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth-session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    const result = verifyCredentials(identifier, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.message || 'Kredensial tidak valid' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirect: '/dashboard',
    });

    // Set cookie sesi aman (valid 7 hari)
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(result.user)),
      httpOnly: false, // Memungkinkan client & SSR sinkron
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses login.' },
      { status: 500 }
    );
  }
}
