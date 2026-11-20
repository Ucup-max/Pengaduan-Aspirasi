'use client';

import React from 'react';
import { Search, ShieldAlert, LogOut, Activity, Database } from 'lucide-react';
import { UserAccount } from '@/types';

interface PetugasHeaderProps {
  user: UserAccount | null;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
}

export function PetugasHeader({
  user,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}: PetugasHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-0 z-10 text-white shadow-md">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari kode tiket (ASP-...), nama pelapor, atau masalah..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls: SLA status pill & Role Badge */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        {/* System Online Pill */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Sistem Aktif (SLA 24 Jam)</span>
        </span>

        {/* Cloud Database Pill */}
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-blue-950/70 text-blue-400 border border-blue-800/80">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Supabase SSR</span>
        </span>

        {/* Role Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Petugas / Dosen</span>
        </span>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          title="Keluar dari akun (Logout)"
          className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 hover:border-rose-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
