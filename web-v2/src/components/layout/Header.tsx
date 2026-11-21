'use client';

import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { UserAccount } from '@/types';

interface HeaderProps {
  user: UserAccount | null;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
}

export function Header({
  user,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  const isDosen = user?.role === 'dosen';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-10">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari informasi atau nomor tiket..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-auto">
        {/* Role Pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
            isDosen
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDosen ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
          />
          <span>Role: {isDosen ? 'Dosen (Akses Penuh)' : 'Mahasiswa'}</span>
        </span>

        {/* Cloud Status Pill */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cloud Supabase Active</span>
        </span>

        {/* Bell Button */}
        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          title="Keluar dari akun (Logout)"
          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
        </button>
      </div>
    </header>
  );
}
