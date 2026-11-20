'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, CheckSquare, BookOpen, LogOut, HelpCircle, User } from 'lucide-react';
import { UserAccount } from '@/types';

interface MahasiswaSidebarProps {
  user: UserAccount | null;
  onLogout: () => void;
  onOpenHelp?: () => void;
}

export function MahasiswaSidebar({ user, onLogout, onOpenHelp }: MahasiswaSidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/dashboard',
      aliases: ['/dashboard', '/beranda'],
      label: 'Beranda',
      icon: Home,
    },
    {
      href: '/aspirasi/buat',
      aliases: ['/aspirasi/buat', '/lapor'],
      label: 'Buat Aspirasi',
      icon: PlusCircle,
    },
    {
      href: '/aspirasi/riwayat',
      aliases: ['/aspirasi/riwayat', '/tiket'],
      label: 'Tiket Saya',
      icon: CheckSquare,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-xs z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Portal Mahasiswa</h1>
            <p className="text-[11px] text-slate-500 font-medium">Sistem Aspirasi Kampus</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              item.aliases.some((alias) => pathname === alias || (alias !== '/dashboard' && pathname.startsWith(`${alias}/`)));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Quick Help */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        {/* Student Identity Card */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.nama || 'Mahasiswa'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                NIM: {user?.nim || '-'} • {user?.kelas || 'TI1D'}
              </p>
            </div>
          </div>
        </div>

        {/* Help & Logout */}
        <div className="flex items-center gap-1.5">
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex-1 py-2 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Bantuan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex-1 py-2 px-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
