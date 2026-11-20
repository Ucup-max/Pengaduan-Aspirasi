'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, LogOut } from 'lucide-react';
import { UserAccount } from '@/types';

interface MahasiswaHeaderProps {
  user: UserAccount | null;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
}

export function MahasiswaHeader({
  user,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}: MahasiswaHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-0 z-10 shadow-2xs">
      {/* Left: Search input */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari status atau nomor tiket..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white"
          />
        </div>
      </div>

      {/* Right: Quick CTA + Badges + Logout */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        {/* Quick Action Button: + Buat Aspirasi Baru */}
        <Link
          href="/aspirasi/buat"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all cursor-pointer group"
        >
          <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
          <span>+ Buat Aspirasi Baru</span>
        </Link>

        {/* Role Badge */}
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Mahasiswa ({user?.kelas || 'TI1D'})</span>
        </span>

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
