import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_COOKIE_NAME = 'aspirasi_session_user';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Sinkronisasi sesi Supabase SSR jika ada token auth
  let response = await updateSession(request);

  // 2. Baca cookie sesi pengguna lokal / RBAC
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  let userSession: { role?: string; nim?: string; nama?: string } | null = null;

  if (sessionCookie?.value) {
    try {
      userSession = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch {
      userSession = null;
    }
  }

  const isAuthenticated = !!userSession && !!userSession.role;
  const isDosen = userSession?.role === 'dosen';

  // 3. Routing aliases & normalisasi rute
  if (pathname === '/beranda') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname === '/lapor') {
    return NextResponse.redirect(new URL('/aspirasi/buat', request.url));
  }
  if (pathname === '/tiket') {
    return NextResponse.redirect(new URL('/aspirasi/riwayat', request.url));
  }
  if (pathname === '/petugas') {
    return NextResponse.redirect(new URL('/petugas/kelola', request.url));
  }

  // 4. Aturan Rute Publik vs Terproteksi
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  const isDosenOnlyRoute = pathname.startsWith('/petugas/kelola');

  // Rute root '/'
  if (pathname === '/') {
    const targetUrl = new URL(isAuthenticated ? '/dashboard' : '/login', request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Jika sudah login dan mencoba mengakses halaman /login, lempar ke /dashboard
  if (pathname === '/login' && isAuthenticated) {
    const targetUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Jika belum login dan mencoba mengakses rute terproteksi
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika login sebagai Mahasiswa namun mencoba mengakses rute khusus Dosen (/petugas/kelola)
  if (isAuthenticated && isDosenOnlyRoute && !isDosen) {
    const forbiddenUrl = new URL('/dashboard', request.url);
    forbiddenUrl.searchParams.set('access_denied', '403');
    return NextResponse.redirect(forbiddenUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, image optimizations, and favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
