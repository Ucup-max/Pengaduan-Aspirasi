'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ListOrdered,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  Eye,
  Edit3,
  MapPin,
  Tag,
  Lock,
  User,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { UpdateStatusModal } from '@/components/staff/UpdateStatusModal';
import { Ticket, TicketStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { updateTicketStatusAction } from '@/app/actions/tickets';

function PetugasDashboardContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'Semua' | TicketStatus>('Semua');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTicketForQuickUpdate, setSelectedTicketForQuickUpdate] = useState<Ticket | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ambil data tiket secara real-time (tanpa cache)
  const loadTickets = useCallback(async (showToastNotice = false) => {
    if (showToastNotice) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/tickets?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.tickets && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.warn('Gagal memuat antrean tiket:', err);
    } finally {
      setIsLoading(false);
      if (showToastNotice) {
        setIsRefreshing(false);
        showToast('Antrean tiket operasional berhasil diperbarui.', 'success');
      }
    }
  }, [showToast]);

  useEffect(() => {
    loadTickets(false);

    const initialFilter = searchParams.get('filter');
    if (initialFilter && ['Pending', 'Diproses', 'Selesai'].includes(initialFilter)) {
      setStatusFilter(initialFilter as TicketStatus);
    } else {
      setStatusFilter('Semua');
    }

    // Auto-refresh interval 10 detik agar tiket baru yang diajukan mahasiswa otomatis muncul
    const timer = setInterval(() => {
      loadTickets(false);
    }, 10000);

    return () => clearInterval(timer);
  }, [searchParams, loadTickets]);

  // SLA Calculation Helper
  const getSlaIndicator = (createdAt: string, status: TicketStatus) => {
    if (status === 'Selesai') {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'SLA Tuntas',
        isWarning: false,
      };
    }

    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffHours = Math.floor((now - createdTime) / (1000 * 60 * 60));

    if (diffHours <= 24) {
      const remaining = 24 - diffHours;
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: `SLA Aman (Sisa ${remaining}j)`,
        isWarning: false,
      };
    } else {
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-bold',
        label: `Lewat SLA (${diffHours}j)`,
        isWarning: true,
      };
    }
  };

  // Metrics
  const totalTickets = tickets.length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const diprosesCount = tickets.filter((t) => t.status === 'Diproses').length;
  const selesaiCount = tickets.filter((t) => t.status === 'Selesai').length;

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set(tickets.map((t) => t.kategori));
    return ['Semua', ...Array.from(set)];
  }, [tickets]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;
      const matchCat = categoryFilter === 'Semua' || t.kategori === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.nomor_tiket.toLowerCase().includes(q) ||
        t.nama_pelapor.toLowerCase().includes(q) ||
        (t.lokasi && t.lokasi.toLowerCase().includes(q)) ||
        t.deskripsi.toLowerCase().includes(q) ||
        t.kategori.toLowerCase().includes(q);

      return matchStatus && matchCat && matchSearch;
    });
  }, [tickets, statusFilter, categoryFilter, searchQuery]);

  const handleQuickUpdateStatus = async (
    ticketId: number | string,
    newStatus: TicketStatus,
    catatan: string
  ) => {
    try {
      const res = await updateTicketStatusAction({
        ticketId,
        newStatus,
        catatan,
      });

      if (!res.success || !res.ticket) {
        showToast(res.error || 'Gagal memperbarui status.', 'error');
        return;
      }

      setTickets((prev) =>
        prev.map((t) => (t.nomor_tiket === res.ticket!.nomor_tiket ? res.ticket! : t))
      );
      showToast(`Status tiket ${res.ticket.nomor_tiket} berhasil diubah ke ${newStatus}!`, 'success');
    } catch {
      showToast('Gagal menghubungi server.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Antrean & Operasional
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
              OPERATOR HELP DESK
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pusat penanganan, koordinasi teknisi lapangan, dan monitoring SLA tiket aduan sivitas kampus.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadTickets(true)}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            title="Segarkan antrean sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Menyegarkan...' : 'Segarkan Antrean'}</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Target SLA: ≤ 24 Jam Kerja</span>
          </span>
        </div>
      </div>

      {/* ================= 1. EMPAT KARTU METRIK BEBAN KERJA ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Masuk */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Beban Aduan</span>
            <ListOrdered className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTickets}</div>
          <p className="text-[11px] text-slate-400">Seluruh tiket masuk</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 sm:p-5 shadow-2xs space-y-2 bg-gradient-to-b from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Menunggu Respon</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-[11px] text-amber-700/80 font-medium">Prioritas tindak lanjut</p>
        </div>

        {/* Diproses */}
        <div className="bg-white rounded-2xl border border-sky-200 p-4 sm:p-5 shadow-2xs space-y-2 bg-gradient-to-b from-white to-sky-50/30">
          <div className="flex items-center justify-between text-sky-700">
            <span className="text-xs font-bold uppercase tracking-wider">Sedang Diproses</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black text-sky-600">{diprosesCount}</div>
          <p className="text-[11px] text-sky-700/80 font-medium">Penanganan teknisi</p>
        </div>

        {/* Selesai */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 sm:p-5 shadow-2xs space-y-2 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Tuntas Diselesaikan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{selesaiCount}</div>
          <p className="text-[11px] text-emerald-700/80 font-medium">Solusi telah diterapkan</p>
        </div>
      </div>

      {/* ================= 2. FILTER & SEARCH CONTROLS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(['Semua', 'Pending', 'Diproses', 'Selesai'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {st}
                {st !== 'Semua' && (
                  <span className="ml-1.5 opacity-80 text-[10px]">
                    ({tickets.filter((t) => t.status === st).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Filters: Category dropdown + Search input */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none focus:border-amber-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    Kategori: {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor, pelapor, atau isi..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. TABEL MANAJEMEN TIKET OPERASIONAL ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Antrean Tiket Masuk ({filteredTickets.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Klik nama tiket untuk membuka panel aksi penuh dan investigasi teknis.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Nomor Tiket & SLA</th>
                <th className="py-3 px-4">Pelapor</th>
                <th className="py-3 px-4">Kategori & Lokasi</th>
                <th className="py-3 px-4">Deskripsi Aduan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Penanganan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => {
                  const sla = getSlaIndicator(t.created_at, t.status);

                  return (
                    <tr
                      key={t.id || t.nomor_tiket}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Nomor Tiket & SLA */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <Link
                            href={`/petugas/tiket/${t.nomor_tiket}`}
                            className="font-mono font-bold text-blue-700 hover:text-blue-900 underline block"
                          >
                            {t.nomor_tiket}
                          </Link>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] border ${sla.badge}`}
                          >
                            {sla.label}
                          </span>
                        </div>
                      </td>

                      {/* Pelapor (Anonim Badge) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          {t.is_anonim ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Anonim (Rahasia)</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t.nama_pelapor}</span>
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400">
                            {new Date(t.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Kategori & Lokasi */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-semibold text-slate-800">
                            {t.kategori}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{t.lokasi || 'Kampus'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Deskripsi */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <p className="text-slate-700 line-clamp-2 leading-relaxed">
                          {t.deskripsi}
                        </p>
                        {t.catatan_penanganan && (
                          <p className="text-[11px] text-blue-700 mt-1 italic line-clamp-1">
                            Solusi: {t.catatan_penanganan}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Aksi Penanganan */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Modal Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedTicketForQuickUpdate(t)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Ubah Cepat Status"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          {/* Full Detail Action Panel */}
                          <Link
                            href={`/petugas/tiket/${t.nomor_tiket}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <span>Panel Aksi</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">Tidak ada tiket yang cocok</p>
                    <p className="text-xs text-slate-400">
                      Seluruh antrean dengan filter ini telah tertangani atau tidak ditemukan.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Update Modal */}
      {selectedTicketForQuickUpdate && (
        <UpdateStatusModal
          isOpen={!!selectedTicketForQuickUpdate}
          onClose={() => setSelectedTicketForQuickUpdate(null)}
          ticket={selectedTicketForQuickUpdate}
          onUpdate={handleQuickUpdateStatus}
        />
      )}
    </div>
  );
}

export default function PetugasDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Command Center...</div>}>
      <PetugasDashboardContent />
    </Suspense>
  );
}
