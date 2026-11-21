'use client';

import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Search, Filter, Edit3, Image as ImageIcon, MapPin, Eye } from 'lucide-react';
import { UpdateStatusModal } from './UpdateStatusModal';

interface StaffQueueTableProps {
  tickets: Ticket[];
  onUpdateTicketStatus: (
    ticketId: number | string,
    newStatus: TicketStatus,
    catatan: string
  ) => Promise<void>;
}

export function StaffQueueTable({
  tickets,
  onUpdateTicketStatus,
}: StaffQueueTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | TicketStatus>('Semua');
  const [selectedTicketForUpdate, setSelectedTicketForUpdate] = useState<Ticket | null>(null);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.nomor_tiket.toLowerCase().includes(q) ||
        t.nama_pelapor.toLowerCase().includes(q) ||
        (t.lokasi && t.lokasi.toLowerCase().includes(q)) ||
        t.deskripsi.toLowerCase().includes(q) ||
        t.kategori.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [tickets, searchQuery, statusFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor tiket, pelapor, atau aduan..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Status Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {(['Semua', 'Pending', 'Diproses', 'Selesai'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {status}
              {status !== 'Semua' && (
                <span className="ml-1.5 opacity-75 text-[10px]">
                  ({tickets.filter((t) => t.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Nomor Tiket</th>
              <th className="py-3 px-4">Pelapor</th>
              <th className="py-3 px-4">Kategori & Lokasi</th>
              <th className="py-3 px-4">Rincian Deskripsi</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi Penanganan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <tr key={t.id || t.nomor_tiket} className="hover:bg-slate-50/60 transition-colors">
                  {/* Nomor Tiket */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {t.nomor_tiket}
                    <span className="block text-[10px] font-sans font-normal text-slate-400">
                      {new Date(t.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Pelapor */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{t.nama_pelapor}</p>
                    {t.is_anonim && (
                      <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                        Anonim
                      </span>
                    )}
                  </td>

                  {/* Kategori & Lokasi */}
                  <td className="py-3.5 px-4 max-w-[180px]">
                    <span className="font-semibold text-slate-800 block truncate">
                      {t.kategori}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{t.lokasi || 'Kampus'}</span>
                    </span>
                  </td>

                  {/* Deskripsi */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="line-clamp-2 text-slate-600 leading-relaxed">{t.deskripsi}</p>
                    {t.lampiran_foto && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Lampiran Foto</span>
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Aksi Button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedTicketForUpdate(t)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <p className="font-semibold text-slate-700">Tidak ada aspirasi yang cocok</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Coba sesuaikan kata kunci pencarian atau ubah filter status.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Update Status */}
      <UpdateStatusModal
        isOpen={!!selectedTicketForUpdate}
        onClose={() => setSelectedTicketForUpdate(null)}
        ticket={selectedTicketForUpdate}
        onUpdate={onUpdateTicketStatus}
      />
    </div>
  );
}
