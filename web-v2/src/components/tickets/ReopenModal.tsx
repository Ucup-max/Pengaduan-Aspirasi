'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';

interface ReopenModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  onSubmit: (reason: string) => Promise<void>;
}

export function ReopenModal({
  isOpen,
  onClose,
  ticketNumber,
  onSubmit,
}: ReopenModalProps) {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Mohon jelaskan kendala yang masih belum terselesaikan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Laporkan Kendala Belum Tuntas"
      subtitle={`Buka kembali tiket #${ticketNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Apakah perbaikan lapangan belum sesuai?</span>
          </p>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Tiket ini akan dikembalikan ke status <strong>"Diproses"</strong> agar teknisi dapat melakukan pengecekan ulang di lokasi.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reopenReason" className="font-bold text-slate-800">
            Jelaskan Bagian yang Belum Selesai <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="reopenReason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Contoh: AC masih meneteskan air saat dihidupkan lebih dari 30 menit..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
          {errorMsg && (
            <p className="text-rose-600 font-semibold text-[11px]">{errorMsg}</p>
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
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
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan Ulang'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
