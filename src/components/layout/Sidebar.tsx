'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, CheckSquare, ListOrdered, BookOpen, Lock, LogOut } from 'lucide-react';
import { UserAccount } from '@/types';

interface SidebarProps {
  user: UserAccount | null;
  onLogout: () => void;
  onOpenHelp?: () => void;
}

export function Sidebar({ user, onLogout, onOpenHelp }: SidebarProps) {
  const pathname = usePathname();
  const isDosen = user?.role === 'dosen';

  const navLinks = [
    {
      href: '/dashboard',
      aliases: ['/beranda', '/dashboard'],
      label: 'Beranda',
      icon: Home,
      locked: false,
    },
    {
      href: '/aspirasi/buat',
      aliases: ['/lapor', '/aspirasi/buat'],
      label: 'Kirim Aspirasi',
      icon: PlusCircle,
      locked: false,
    },
    {
      href: '/aspirasi/riwayat',
      aliases: ['/tiket', '/aspirasi/riwayat'],
      label: 'Nomor Tiket & Status',
      icon: CheckSquare,
      locked: false,
    },
    {
      href: '/petugas/kelola',
      aliases: ['/petugas', '/petugas/kelola'],
      label: 'Antrean Aspirasi',
      icon: ListOrdered,
      locked: !isDosen,
      badgeText: 'Khusus Dosen',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-xs z-20">
      <div>
        {/* Brand Logo & Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Aspirasi Mahasiswa</h1>
            <p className="text-[11px] text-slate-400 font-medium">Portal Pengaduan Kampus</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navLinks.map((item) => {
            const isActive =
              item.aliases.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`));
            const Icon = item.icon;

            if (item.locked) {
              return (
                <div
                  key={item.href}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-50/60 cursor-not-allowed opacity-75"
                  title="Fitur terkunci untuk mahasiswa: khusus role Dosen / Petugas"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{item.badgeText}</span>
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* SOP Guide Link */}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Informasi</span>
          </div>
          <Link
            href="/panduan"
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/panduan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Panduan & SOP</span>
            </div>
          </Link>
        </nav>
      </div>

      {/* User Profile Card */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 text-white ${
              isDosen ? 'bg-amber-600' : 'bg-indigo-600'
            }`}
          >
            {user?.nama ? user.nama.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.nama || 'Mahasiswa'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {isDosen ? 'Dosen (Akses Penuh)' : `${user?.nim || 'Mahasiswa'} • ${user?.kelas || 'Pelapor'}`}
            </p>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
          <button
            type="button"
            onClick={onOpenHelp}
            className="hover:text-slate-700 cursor-pointer"
          >
            Bantuan & Kontak
          </button>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold border border-slate-200 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          title="Keluar dari sesi akun saat ini"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
