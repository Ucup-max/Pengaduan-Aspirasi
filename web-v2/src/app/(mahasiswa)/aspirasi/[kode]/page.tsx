'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Star,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { StatusStepper } from '@/components/tickets/StatusStepper';
import { RatingModal } from '@/components/tickets/RatingModal';
import { ReopenModal } from '@/components/tickets/ReopenModal';
import { Ticket } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { getTicketByCodeAction, confirmTicketResolutionAction, reopenTicketAction } from '@/app/actions/tickets';

interface PageProps {
  params: Promise<{ kode: string }>;
}

export default function MahasiswaTicketDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const resolvedParams = use(params);
  const ticketCode = decodeURIComponent(resolvedParams.kode);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  useEffect(() => {
    getTicketByCodeAction(ticketCode)
      .then((data) => {
        setTicket(data);
      })
      .catch(() => {
        showToast('Gagal memuat rincian tiket.', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [ticketCode, showToast]);

  const handleConfirmRating = async (rating: number, feedback: string) => {
    if (!ticket) return;
    try {
      await confirmTicketResolutionAction({
        ticketId: ticket.nomor_tiket,
        rating,
        feedback,
      });

      setTicket((prev) =>
        prev
          ? {
              ...prev,
              konfirmasi_selesai: true,
              rating,
              feedback,
            }
          : null
      );
      showToast('Terima kasih atas konfirmasi kepuasan Anda!', 'success');
      setIsRatingModalOpen(false);
    } catch {
      showToast('Gagal menyimpan konfirmasi rating.', 'error');
    }
  };

  const handleReopen = async (reason: string) => {
    if (!ticket) return;
    try {
      const res = await reopenTicketAction({
        ticketId: ticket.nomor_tiket,
        reason,
      });

      if (res.success && res.ticket) {
        setTicket(res.ticket);
        showToast('Tiket berhasil dibuka kembali untuk ditindaklanjuti ulang.', 'info');
        setIsReopenModalOpen(false);
      }
    } catch {
      showToast('Gagal membuka kembali tiket.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Memuat detail tiket {ticketCode}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Tiket Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Nomor tiket <strong>{ticketCode}</strong> tidak terdaftar dalam pangkalan data sistem.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const isResolved = ticket.status === 'Selesai';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/aspirasi/riwayat"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat Tiket</span>
        </Link>

        <span className="text-[11px] font-mono text-slate-400">
          ID: {ticket.nomor_tiket}
        </span>
      </div>

      {/* Main Ticket Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-mono font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200/60">
                {ticket.nomor_tiket}
              </span>
              <StatusBadge status={ticket.status} />
              {ticket.is_anonim && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  🔒 Anonim
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Aduan {ticket.kategori}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Visual Timeline Stepper */}
        <div className="py-2">
          <StatusStepper status={ticket.status} />
        </div>

        {/* Complaint Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Lokasi Spesifik</span>
            </div>
            <p className="text-slate-800 font-semibold">{ticket.lokasi || 'Lingkungan Kampus'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Kategori Masalah</span>
            </div>
            <p className="text-slate-800 font-semibold">{ticket.kategori}</p>
          </div>
        </div>

        {/* Complaint Text */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Deskripsi Laporan Pengaduan
          </label>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
            {ticket.deskripsi}
          </div>
        </div>

        {/* Photo Evidence if uploaded */}
        {ticket.lampiran_foto && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Foto Bukti Kerusakan / Kendala</span>
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-md bg-slate-100">
              <img
                src={ticket.lampiran_foto}
                alt="Bukti Pengaduan"
                className="w-full h-auto max-h-72 object-cover"
              />
            </div>
          </div>
        )}

        {/* Staff Follow-up Notes & Resolution Proof */}
        {ticket.catatan_penanganan && (
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Tanggapan & Solusi dari Petugas Kampus</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.catatan_penanganan}
            </p>

            {ticket.bukti_penyelesaian && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-blue-800 block mb-1.5">
                  Foto Bukti Penyelesaian Petugas:
                </span>
                <img
                  src={ticket.bukti_penyelesaian}
                  alt="Bukti Penyelesaian"
                  className="rounded-xl border border-blue-200 max-h-56 object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* ================= STUDENT ACTION PANEL ================= */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          {isResolved ? (
            ticket.konfirmasi_selesai ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Aspirasi Ini Telah Dikonfirmasi Selesai</p>
                  <div className="flex items-center gap-1 text-amber-500 py-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (ticket.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-semibold text-slate-600">
                      ({ticket.rating || 5}/5 Bintang)
                    </span>
                  </div>
                  {ticket.feedback && (
                    <p className="text-slate-600 italic text-[11px]">
                      &quot;{ticket.feedback}&quot;
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Petugas Menandai Laporan Telah Selesai Ditangani</span>
                </div>
                <p className="text-xs text-slate-600">
                  Mohon periksa fasilitas/layanan terkait. Apakah kendala Anda telah tertangani dengan baik?
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRatingModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Selesai & Beri Penilaian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReopenModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Belum Selesai? Buka Kembali</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Laporan ini sedang dalam tahap <strong>{ticket.status}</strong>. Tim teknisi kampus terus memperbarui progres penanganan secara langsung.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rating & Satisfaction Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleConfirmRating}
        ticketNumber={ticket.nomor_tiket}
      />

      {/* Reopen Modal */}
      <ReopenModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onSubmit={handleReopen}
        ticketNumber={ticket.nomor_tiket}
      />
    </div>
  );
}
