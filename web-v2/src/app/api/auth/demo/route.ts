import { NextResponse } from 'next/server';
import { DEMO_MAHASISWA, DEMO_DOSEN, AUTH_COOKIE_NAME } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = body.role || 'mahasiswa';

    const selectedAccount = role === 'dosen' ? DEMO_DOSEN : DEMO_MAHASISWA;

    const user = {
      nim: selectedAccount.nim,
      nama: selectedAccount.nama,
      kelas: selectedAccount.kelas,
      username: selectedAccount.username,
      role: selectedAccount.role,
    };

    const response = NextResponse.json({
      success: true,
      user,
      redirect: '/dashboard',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(user)),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memproses login akun demo.' },
      { status: 500 }
    );
  }
}
