'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { TicketTracker } from '@/components/dashboard/TicketTracker';
import { CategoryCards } from '@/components/dashboard/CategoryCards';
import { AccessDeniedModal } from '@/components/auth/AccessDeniedModal';
import { HelpModal } from '@/components/auth/HelpModal';
import { UserAccount, Ticket, TicketStats } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 3,
    pending: 1,
    diproses: 1,
    selesai: 1,
  });
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 1. Fetch current user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));

    // 2. Fetch tickets & calculate stats
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          const list: Ticket[] = data.tickets;
          setTickets(list);
          const total = list.length;
          const pending = list.filter((t) => t.status === 'Pending').length;
          const diproses = list.filter((t) => t.status === 'Diproses').length;
          const selesai = list.filter((t) => t.status === 'Selesai').length;
          setStats({ total, pending, diproses, selesai });
        }
      })
      .catch(() => {});

    // Check if redirected from forbidden route (HTTP 403)
    if (searchParams.get('access_denied') === '403') {
      setIsAccessDeniedOpen(true);
    }
  }, [router, searchParams]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari akun.', 'info');
    router.push('/login');
    router.refresh();
  };

  const handleGlobalSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/aspirasi/riwayat?ticket=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Recent resolved tickets
  const recentResolved = tickets.filter((t) => t.status === 'Selesai').slice(0, 2);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen w-full">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleGlobalSearch}
        />

        <main className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          {/* 1. HERO BANNER INTERAKTIF */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-7 sm:p-10 shadow-lg border border-slate-800">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PORTAL LAYANAN RESMI MAHASISWA</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Suarakan Aspirasi, Wujudkan Kampus yang Lebih Baik.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                Sampaikan kendala fasilitas, layanan akademik, atau masukan konstruktif secara terpusat, transparan, dan terverifikasi dalam batas waktu 1x24 jam kerja.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/aspirasi/buat"
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>✍️ Buat Aspirasi Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/aspirasi/riwayat"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Lacak Status Tiket</span>
                </Link>

                <Link
                  href="/panduan"
                  className="px-4 py-3 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Baca Panduan & SOP →
                </Link>
              </div>
            </div>

            {/* Decorative subtle graphic */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* 2. WIDGET PELACAK TIKET CEPAT */}
          <TicketTracker />

          {/* 3. KARTU STATISTIK & TRANSPARANSI */}
          <MetricCards stats={stats} />

          {/* 4. PEMILIH KATEGORI CEPAT */}
          <CategoryCards />

          {/* 5. TIKET TUNTAS TERKINI */}
          {recentResolved.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Daftar Aspirasi Tuntas Terkini
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">Bukti penanganan nyata</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {recentResolved.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ticket.nomor_tiket}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">{ticket.kategori}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {ticket.deskripsi}
                    </p>
                    {ticket.catatan_penanganan && (
                      <p className="text-[10px] text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                        <strong>Solusi Petugas:</strong> {ticket.catatan_penanganan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. TIGA LANGKAH SISTEM */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              3 Langkah Penanganan Aspirasi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-800">Isi Formulir</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Tuliskan kendala lokasi dan rincian masalah secara jelas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-800">Simpan Nomor Tiket</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Gunakan kode unik (contoh: ASP-000123) untuk melacak status.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-800">Penyelesaian Kendala</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Staf & teknisi melakukan tindakan perbaikan lapangan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        onClose={() => setIsAccessDeniedOpen(false)}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
