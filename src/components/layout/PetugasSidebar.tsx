'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Inbox,
  Clock,
  CheckCircle2,
  LogOut,
  HelpCircle,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { UserAccount } from '@/types';

interface PetugasSidebarProps {
  user: UserAccount | null;
  onLogout: () => void;
  onOpenHelp?: () => void;
}

export function PetugasSidebar({ user, onLogout, onOpenHelp }: PetugasSidebarProps) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ pending: number; diproses: number; selesai: number }>({
    pending: 0,
    diproses: 0,
    selesai: 0,
  });

  useEffect(() => {
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets && Array.isArray(data.tickets)) {
          const list = data.tickets;
          setCounts({
            pending: list.filter((t: any) => t.status === 'Pending').length,
            diproses: list.filter((t: any) => t.status === 'Diproses').length,
            selesai: list.filter((t: any) => t.status === 'Selesai').length,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navLinks = [
    {
      href: '/petugas/dashboard',
      aliases: ['/petugas/dashboard', '/petugas/kelola', '/petugas/antrean'],
      label: 'Antrean Tiket',
      icon: Inbox,
      badge: counts.pending,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      href: '/petugas/diproses',
      aliases: ['/petugas/diproses'],
      label: 'Sedang Diproses',
      icon: Clock,
      badge: counts.diproses,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      href: '/petugas/riwayat',
      aliases: ['/petugas/riwayat'],
      label: 'Riwayat Selesai',
      icon: CheckCircle2,
      badge: counts.selesai,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  return (
    <aside className="w-full md:w-68 bg-[#090e17] border-r border-slate-800/80 flex flex-col justify-between shrink-0 shadow-lg text-slate-300 z-20">
      <div>
        {/* Brand Header - Operational Command Center */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3 bg-gradient-to-r from-slate-900 to-[#0c1424]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
            <Terminal className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-white tracking-wide">COMMAND CENTER</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
              Operasional Petugas Helpdesk
            </p>
          </div>
        </div>

        {/* Section Notice */}
        <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono uppercase text-[9px] tracking-wider">
            Status Antrean Masuk
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {counts.pending} Tiket Baru
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Navigasi Penanganan
          </div>
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              item.aliases.some((alias) => pathname === alias || (alias !== '/petugas/dashboard' && pathname.startsWith(`${alias}/`)));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-blue-500/10 text-white border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Badge count */}
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Operator Info & SLA Status */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#060a12]">
        {/* SLA Guard Indicator */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[9px] uppercase">Standar SLA</span>
            <span className="text-emerald-400 font-bold text-[10px]">≤ 24 Jam</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-full rounded-full" />
          </div>
        </div>

        {/* Staff Profile Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {user?.nama || 'Petugas Helpdesk'}
            </p>
            <p className="text-[10px] text-amber-400/90 font-mono truncate">
              ROLE: {user?.role === 'dosen' ? 'DOSEN / OPERATOR' : 'PETUGAS'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex-1 py-2 px-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>SOP</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex-1 py-2 px-2 rounded-lg border border-rose-900/50 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
