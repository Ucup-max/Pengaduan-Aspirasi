'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Ticket, TicketStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onUpdate: (
    ticketId: number | string,
    newStatus: TicketStatus,
    catatan: string
  ) => Promise<void>;
}

export function UpdateStatusModal({
  isOpen,
  onClose,
  ticket,
  onUpdate,
}: UpdateStatusModalProps) {
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket?.status || 'Diproses');
  const [catatan, setCatatan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when ticket changes
  React.useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status === 'Pending' ? 'Diproses' : ticket.status);
      setCatatan('');
      setErrorMsg('');
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCatatan = catatan.trim();
    if (!cleanCatatan) {
      setErrorMsg('Wajib mengisi Catatan Penanganan / Solusi sebelum memperbarui status.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(ticket.nomor_tiket || ticket.id, newStatus, cleanCatatan);
      onClose();
    } catch {
      setErrorMsg('Gagal memperbarui status tiket. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perbarui Status Penanganan Aspirasi"
      subtitle={`Tiket #${ticket.nomor_tiket} • Pelapor: ${ticket.nama_pelapor}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        {/* Detail Ringkas */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Status Saat Ini:</span>
            <StatusBadge status={ticket.status} />
          </div>
          <div>
            <span className="font-semibold text-slate-500">Lokasi Kendala:</span>
            <p className="font-bold text-slate-800">{ticket.lokasi || 'Lingkungan Kampus'}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Rincian Laporan:</span>
            <p className="text-slate-700 mt-0.5 line-clamp-3 bg-white p-2 rounded-xl border border-slate-100">
              {ticket.deskripsi}
            </p>
          </div>

          {/* Foto Bukti jika ada */}
          {ticket.lampiran_foto && (
            <div>
              <span className="font-semibold text-slate-500 block mb-1">
                Foto Bukti dari Pelapor:
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={ticket.lampiran_foto}
                  alt="Bukti Aduan"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white"
                />
                <span className="text-[11px] text-indigo-600 font-semibold">
                  Lampiran foto tersedia
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pemilihan Status Baru */}
        <div className="space-y-1.5">
          <label htmlFor="selectNewStatus" className="font-bold text-slate-800">
            Ubah Status Menjadi <span className="text-rose-500">*</span>
          </label>
          <select
            id="selectNewStatus"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white transition-all"
          >
            <option value="Pending">Pending (Menunggu Verifikasi)</option>
            <option value="Diproses">Diproses (Sedang Dikerjakan Teknisi)</option>
            <option value="Selesai">Selesai (Tuntas Ditangani)</option>
          </select>
        </div>

        {/* Input Wajib Catatan Solusi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="catatanPenanganan" className="font-bold text-slate-800">
              Catatan Penanganan / Solusi <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-amber-600 font-bold">Wajib Diisi</span>
          </div>
          <textarea
            id="catatanPenanganan"
            rows={3}
            value={catatan}
            onChange={(e) => {
              setCatatan(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Jelaskan tindakan perbaikan teknisi atau solusi yang telah dilakukan..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400">
            Catatan ini akan langsung terlihat oleh mahasiswa pelapor pada timeline status tiketnya.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan...' : 'Perbarui Status Tiket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
