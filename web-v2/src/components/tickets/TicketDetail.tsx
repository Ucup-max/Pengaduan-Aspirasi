'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types';
import { StatusStepper } from './StatusStepper';
import { RatingModal } from './RatingModal';
import { ReopenModal } from './ReopenModal';
import { useToast } from '@/components/ui/Toast';
import { Copy, Check, Clock, ShieldCheck, MapPin, Star, AlertTriangle, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  onConfirmFinish: (ticketId: number | string, rating: number, feedback: string) => Promise<void>;
  onReopenTicket: (ticketId: number | string, reason: string) => Promise<void>;
}

export function TicketDetail({
  ticket,
  onConfirmFinish,
  onReopenTicket,
}: TicketDetailProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.nomor_tiket);
    setCopied(true);
    showToast('Nomor tiket berhasil disalin!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isSelesai = ticket.status === 'Selesai';
  const isConfirmed = ticket.konfirmasi_selesai;

  return (
    <div className="space-y-6">
      {/* 2 Kolom Grid Kartu Tiket & Tahapan Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* KARTU KIRI: NOMOR TIKET RESMI */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Izin Pengaduan Resmi</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                TERDAFTAR
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Nomor Tiket</p>
            <div className="flex items-center gap-2 my-2">
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
                {ticket.nomor_tiket}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                title="Salin Nomor Tiket"
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gunakan nomor tiket ini sebagai rujukan utama saat memeriksa status atau konfirmasi dengan petugas kampus.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Nomor Tiket Disalin!' : 'Salin Nomor Tiket'}</span>
            </button>
          </div>
        </div>

        {/* KARTU KANAN: TAHAPAN PENANGANAN & RINGKASAN */}
        <div className="md:col-span-7 space-y-4">
          {/* Status Stepper */}
          <StatusStepper status={ticket.status} />

          {/* Ringkasan Laporan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Ringkasan Laporan</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Nama Pelapor:</span>
                <span className="font-bold text-slate-800">{ticket.nama_pelapor}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Lokasi Spesifik:</span>
                <span className="font-bold text-slate-800 text-right">{ticket.lokasi || 'Lingkungan Kampus'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Kategori:</span>
                <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                  {ticket.kategori}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 font-medium block mb-1">Deskripsi Aspirasi:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed break-words font-normal">
                  {ticket.deskripsi}
                </p>
              </div>

              {/* Lampiran Foto Bukti */}
              {ticket.lampiran_foto && (
                <div className="py-1">
                  <span className="text-slate-400 font-medium block mb-1">Foto Bukti Lampiran:</span>
                  <div className="flex items-center gap-3">
                    <img
                      src={ticket.lampiran_foto}
                      alt="Foto Bukti"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white"
                    />
                    <span className="text-[11px] text-indigo-600 font-bold">
                      Lampiran foto terverifikasi
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE RIWAYAT STATUS PENANGANAN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase">
              Riwayat & Catatan Tindak Lanjut dari Petugas
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {ticket.riwayat?.length || 1} Riwayat
          </span>
        </div>

        <div className="relative pl-5 space-y-4 pt-1 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {ticket.riwayat && ticket.riwayat.length > 0 ? (
            ticket.riwayat.map((hist, idx) => (
              <div key={idx} className="relative space-y-1">
                <div
                  className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    hist.status === 'Selesai'
                      ? 'bg-emerald-500 ring-2 ring-emerald-200'
                      : hist.status === 'Diproses'
                      ? 'bg-sky-500 ring-2 ring-sky-200'
                      : 'bg-amber-500 ring-2 ring-amber-200'
                  }`}
                />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Status: {hist.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(hist.waktu).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {hist.catatan}
                </p>
                <p className="text-[10px] text-slate-400">
                  Diperbarui oleh: <strong>{hist.petugas}</strong>
                </p>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-400">
              Belum ada pembaruan status tindak lanjut.
            </div>
          )}
        </div>
      </div>

      {/* AKSI PELAPOR JIKA STATUS SELESAI */}
      {isSelesai && (
        <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-sm space-y-3 bg-gradient-to-br from-white to-emerald-50/30">
          {isConfirmed ? (
            <div className="space-y-2 text-center py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="text-xs font-bold text-emerald-900">
                Penanganan Telah Dikonfirmasi Tuntas
              </h4>
              <div className="text-amber-500 font-bold text-sm">
                {'★'.repeat(ticket.rating || 5)} ({ticket.rating || 5}/5)
              </div>
              {ticket.feedback && (
                <p className="text-xs text-slate-600 italic">"{ticket.feedback}"</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Konfirmasi Penyelesaian Kendala
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Perlu Respon Anda
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Laporan ini telah ditandai <strong>"Selesai"</strong> oleh petugas. Silakan periksa hasil perbaikan dan konfirmasi statusnya:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRatingOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span>Konfirmasi Tuntas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReopenOpen(true)}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Laporkan Belum Selesai</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating & Reopen Modals */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        ticketNumber={ticket.nomor_tiket}
        onSubmit={async (rating, feedback) => {
          await onConfirmFinish(ticket.id, rating, feedback);
          showToast('Terima kasih! Penilaian Anda telah disimpan.', 'success');
        }}
      />

      <ReopenModal
        isOpen={isReopenOpen}
        onClose={() => setIsReopenOpen(false)}
        ticketNumber={ticket.nomor_tiket}
        onSubmit={async (reason) => {
          await onReopenTicket(ticket.id, reason);
          showToast('Tiket dibuka kembali untuk ditindaklanjuti ulang oleh petugas.', 'info');
        }}
      />
    </div>
  );
}
