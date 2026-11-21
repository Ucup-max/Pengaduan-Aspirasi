import { cookies } from 'next/headers';
import { UserAccount, UserRole } from '@/types';
import { AUTH_COOKIE_NAME, USER_ACCOUNTS } from '@/lib/constants';

export async function getServerSessionUser(): Promise<UserAccount | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(sessionCookie.value)) as UserAccount;
    // Validate user still exists in database/accounts list
    const found = USER_ACCOUNTS.find(
      u => u.nim === parsed.nim || u.username.toLowerCase() === parsed.username.toLowerCase()
    );
    if (!found) return null;

    return {
      nim: found.nim,
      nama: found.nama,
      kelas: found.kelas,
      username: found.username,
      role: found.role
    };
  } catch {
    return null;
  }
}

export function verifyCredentials(identifier: string, password: string): { success: boolean; user?: UserAccount; message?: string } {
  if (!identifier || !password) {
    return { success: false, message: 'NIM / Username dan kata sandi wajib diisi.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  const user = USER_ACCOUNTS.find(
    u => u.nim.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
  );

  if (!user) {
    return { success: false, message: 'NIM atau Username tidak terdaftar dalam pangkalan data kampus.' };
  }

  if (user.password !== cleanPass) {
    return { success: false, message: 'Kata sandi tidak sesuai. Perhatikan huruf besar/kecil dan karakter khusus.' };
  }

  return {
    success: true,
    user: {
      nim: user.nim,
      nama: user.nama,
      kelas: user.kelas,
      username: user.username,
      role: user.role
    }
  };
}
