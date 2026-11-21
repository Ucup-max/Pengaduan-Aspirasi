'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { Ticket, TicketStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, Plus, Inbox, Filter, Search, ArrowRight } from 'lucide-react';
import { confirmTicketResolutionAction, reopenTicketAction } from '@/app/actions/tickets';

function RiwayatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Semua' | TicketStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const targetTicketQuery = searchParams.get('ticket');
  const isRecent = searchParams.get('recent') === '1';

  useEffect(() => {
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          const list: Ticket[] = data.tickets;
          setTickets(list);

          if (targetTicketQuery) {
            const found = list.find(
              (t) => t.nomor_tiket.toLowerCase() === targetTicketQuery.toLowerCase()
            );
            if (found) {
              setSelectedTicket(found);
            } else if (list.length > 0) {
              setSelectedTicket(list[0]);
            }
          } else if (list.length > 0) {
            setSelectedTicket(list[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [targetTicketQuery]);

  const handleConfirmFinish = async (
    ticketId: number | string,
    rating: number,
    feedback: string
  ) => {
    try {
      await confirmTicketResolutionAction({
        ticketId,
        rating,
        feedback,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId || t.nomor_tiket === ticketId
            ? { ...t, konfirmasi_selesai: true, rating, feedback }
            : t
        )
      );
      if (selectedTicket && (selectedTicket.id === ticketId || selectedTicket.nomor_tiket === ticketId)) {
        setSelectedTicket({
          ...selectedTicket,
          konfirmasi_selesai: true,
          rating,
          feedback,
        });
      }
      showToast('Terima kasih atas konfirmasi kepuasan Anda!', 'success');
    } catch {
      showToast('Gagal mengirimkan konfirmasi rating.', 'error');
    }
  };

  const handleReopenTicket = async (ticketId: number | string, reason: string) => {
    try {
      const result = await reopenTicketAction({
        ticketId,
        reason,
      });

      if (result.success && result.ticket) {
        setTickets((prev) =>
          prev.map((t) =>
            t.nomor_tiket === result.ticket!.nomor_tiket ? result.ticket! : t
          )
        );
        setSelectedTicket(result.ticket);
        showToast('Tiket berhasil dibuka kembali untuk penanganan ulang.', 'info');
      }
    } catch {
      showToast('Gagal membuka kembali tiket.', 'error');
    }
  };

  // Filtered tickets
  const filteredList = tickets.filter((t) => {
    const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      t.nomor_tiket.toLowerCase().includes(q) ||
      t.kategori.toLowerCase().includes(q) ||
      t.deskripsi.toLowerCase().includes(q) ||
      (t.lokasi && t.lokasi.toLowerCase().includes(q));

    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isRecent ? 'Aspirasi Berhasil Dikirim' : 'Riwayat Tiket Saya'}
            </h1>
            {isRecent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                Baru
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Pantau transparansi progres dan catatan tindak lanjut dari seluruh laporan yang Anda ajukan.
          </p>
        </div>

        <Link
          href="/aspirasi/buat"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Baru</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
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
                <span className="ml-1.5 opacity-75 text-[10px]">
                  ({tickets.filter((t) => t.status === st).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci tiket..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Split: Ticket List on Left, Selected Ticket on Right */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Cards List (5 columns) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Daftar Tiket ({filteredList.length})
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk melihat rincian</span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredList.map((t) => (
                <div
                  key={t.id || t.nomor_tiket}
                  onClick={() => setSelectedTicket(t)}
                  className="cursor-pointer"
                >
                  <TicketCard
                    ticket={t}
                    isSelected={selectedTicket?.nomor_tiket === t.nomor_tiket}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed View (7 columns) */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Panel Progres Tiket
                  </span>
                  <Link
                    href={`/aspirasi/${selectedTicket.nomor_tiket}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>Buka Layar Penuh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <TicketDetail
                  ticket={selectedTicket}
                  onConfirmFinish={handleConfirmFinish}
                  onReopenTicket={handleReopenTicket}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Pilih tiket di sebelah kiri untuk melihat rincian penanganan.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada aspirasi yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Belum ada tiket dengan filter atau kata kunci yang Anda masukkan.
          </p>
          <Link
            href="/aspirasi/buat"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-all"
          >
            + Buat Aspirasi Baru
          </Link>
        </div>
      )}
    </div>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat riwayat tiket...</div>}>
      <RiwayatContent />
    </Suspense>
  );
}
