'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Ticket as TicketIcon,
  Search,
} from 'lucide-react';
import { CategoryCards } from '@/components/dashboard/CategoryCards';
import { StatusBadge } from '@/components/ui/Badge';
import { AccessDeniedModal } from '@/components/auth/AccessDeniedModal';
import { UserAccount, Ticket } from '@/types';

function MahasiswaDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [latestTicket, setLatestTicket] = useState<Ticket | null>(null);
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [trackerCode, setTrackerCode] = useState('');

  useEffect(() => {
    // 1. Ambil data sesi pengguna saat ini
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    // 2. Ambil data tiket secara real-time (tanpa cache)
    const fetchTickets = () => {
      fetch(`/api/tickets?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.tickets && Array.isArray(data.tickets)) {
            const list: Ticket[] = data.tickets;
            setTickets(list);
            if (list.length > 0) {
              setLatestTicket(list[0]);
            }
          }
        })
        .catch(() => {});
    };

    fetchTickets();
    const timer = setInterval(fetchTickets, 10000);

    // Periksa jika diarahkan dari 403 Forbidden
    if (searchParams.get('access_denied') === '403') {
      setIsAccessDeniedOpen(true);
    }

    return () => clearInterval(timer);
  }, [searchParams]);

  // Statistik personal mahasiswa
  const totalAspirasi = tickets.length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const diprosesCount = tickets.filter((t) => t.status === 'Diproses').length;
  const selesaiCount = tickets.filter((t) => t.status === 'Selesai').length;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackerCode.trim()) {
      router.push(`/aspirasi/${encodeURIComponent(trackerCode.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. WELCOME HERO & QUICK REPORT CTA ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-blue-200 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Layanan Cepat Terpadu Mahasiswa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Halo, {user?.nama || 'Mahasiswa'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Ada kendala sarana ruang kelas, jaringan WiFi, atau fasilitas perkuliahan? Sampaikan aspirasi Anda sekarang untuk segera ditangani tim kampus.
            </p>
          </div>

          <Link
            href="/aspirasi/buat"
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-600 group-hover:rotate-90 transition-transform" />
            <span>+ Buat Aspirasi Baru</span>
          </Link>
        </div>
      </div>

      {/* ================= 2. PERSONAL METRICS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Aduan Saya</span>
            <TicketIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAspirasi}</div>
          <p className="text-[10px] text-slate-400 mt-1">Laporan tercatat</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-semibold">Menunggu Respon</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Dalam antrean</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-sky-600 mb-1">
            <span className="text-xs font-semibold">Sedang Diproses</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600">{diprosesCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Tindak lanjut teknisi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Selesai Ditangani</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{selesaiCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Telah diselesaikan</p>
        </div>
      </div>

      {/* ================= 3. STATUS 1 TIKET TERAKHIR MILIK MAHASISWA ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Status Tiket Terakhir Anda</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau tindak lanjut nyata laporan terbaru yang sedang berjalan di kampus.
            </p>
          </div>
          <Link
            href="/aspirasi/riwayat"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Semua Tiket Saya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestTicket ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {latestTicket.nomor_tiket}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {latestTicket.kategori}
                </span>
                {latestTicket.is_anonim && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Anonim
                  </span>
                )}
              </div>
              <StatusBadge status={latestTicket.status} />
            </div>

            <p className="text-xs text-slate-700 font-medium line-clamp-2">
              {latestTicket.deskripsi}
            </p>

            <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>Lokasi: {latestTicket.lokasi || 'Lingkungan Kampus'}</span>
              <Link
                href={`/aspirasi/${latestTicket.nomor_tiket}`}
                className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Timeline Progres Lengkap</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <TicketIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Belum ada aspirasi yang dikirimkan</p>
            <p className="text-[11px] text-slate-400">
              Laporan atau masukan yang Anda kirimkan akan terpantau otomatis di sini.
            </p>
            <Link
              href="/aspirasi/buat"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
            >
              + Kirim Laporan Pertama
            </Link>
          </div>
        )}

        {/* Input Lacak Cepat Kode Lain */}
        <form onSubmit={handleLookup} className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={trackerCode}
              onChange={(e) => setTrackerCode(e.target.value)}
              placeholder="Punya nomor tiket lain? Masukkan kode ASP-XXXXXX..."
              className="w-full pl-10 pr-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none uppercase placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 bg-white"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Lacak
          </button>
        </form>
      </div>

      {/* ================= 4. EMPAT KARTU KATEGORI KENDALA ================= */}
      <CategoryCards />

      {/* Access Denied Modal jika dicegat middleware */}
      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        onClose={() => setIsAccessDeniedOpen(false)}
      />
    </div>
  );
}

export default function MahasiswaDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat portal mahasiswa...</div>}>
      <MahasiswaDashboardContent />
    </Suspense>
  );
}
