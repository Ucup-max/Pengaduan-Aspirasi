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
  const isStaff = userSession?.role === 'dosen' || userSession?.role === 'petugas';

  // 3. Routing Aliases & Normalisasi
  if (pathname === '/beranda') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname === '/lapor') {
    return NextResponse.redirect(new URL('/aspirasi/buat', request.url));
  }
  if (pathname === '/tiket') {
    return NextResponse.redirect(new URL('/aspirasi/riwayat', request.url));
  }
  if (pathname === '/petugas' || pathname === '/petugas/kelola') {
    return NextResponse.redirect(new URL('/petugas/dashboard', request.url));
  }

  // 4. Aturan Rute Publik vs Terproteksi
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  const isStaffRoute = pathname.startsWith('/petugas');
  const isStudentRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/aspirasi');

  // Rute Root '/'
  if (pathname === '/') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const targetUrl = new URL(isStaff ? '/petugas/dashboard' : '/dashboard', request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Jika sudah login dan mencoba mengakses halaman /login
  if (pathname === '/login' && isAuthenticated) {
    const targetUrl = new URL(isStaff ? '/petugas/dashboard' : '/dashboard', request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Jika belum login dan mencoba mengakses rute terproteksi
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika login sebagai Mahasiswa namun mencoba mengakses rute khusus Petugas (/petugas/*)
  if (isAuthenticated && isStaffRoute && !isStaff) {
    const forbiddenUrl = new URL('/dashboard', request.url);
    forbiddenUrl.searchParams.set('access_denied', '403');
    return NextResponse.redirect(forbiddenUrl);
  }

  // Jika login sebagai Petugas/Dosen dan membuka rute khusus Mahasiswa (/dashboard, /aspirasi/*)
  if (isAuthenticated && isStudentRoute && isStaff) {
    const staffHomeUrl = new URL('/petugas/dashboard', request.url);
    return NextResponse.redirect(staffHomeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, image optimizations, and favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
};
