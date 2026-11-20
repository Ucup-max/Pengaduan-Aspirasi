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
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  User,
  Lock,
  Save,
  CheckSquare,
  AlertTriangle,
  FileText,
  Star,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Ticket, TicketStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { getTicketByCodeAction, updateTicketStatusAction } from '@/app/actions/tickets';

interface PageProps {
  params: Promise<{ kode: string }>;
}

export default function PetugasTicketActionPage({ params }: PageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const resolvedParams = use(params);
  const ticketCode = decodeURIComponent(resolvedParams.kode);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Panel Aksi Petugas State
  const [newStatus, setNewStatus] = useState<TicketStatus>('Diproses');
  const [catatan, setCatatan] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorValidation, setErrorValidation] = useState('');

  useEffect(() => {
    getTicketByCodeAction(ticketCode)
      .then((data) => {
        if (data) {
          setTicket(data);
          setNewStatus(data.status);
          setCatatan(data.catatan_penanganan || '');
        }
      })
      .catch(() => {
        showToast('Gagal memuat detail tiket.', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [ticketCode, showToast]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran foto bukti maksimal 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidation('');

    if (!catatan.trim()) {
      setErrorValidation('Catatan penanganan / tindak lanjut wajib diisi oleh petugas.');
      return;
    }

    if (catatan.trim().length < 10) {
      setErrorValidation('Berikan rincian tindak lanjut minimal 10 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateTicketStatusAction({
        ticketId: ticket!.nomor_tiket,
        newStatus,
        catatan: catatan.trim(),
        buktiFoto: proofPhoto,
      });

      if (!res.success || !res.ticket) {
        setErrorValidation(res.error || 'Gagal menyimpan status tiket.');
        setIsSubmitting(false);
        return;
      }

      setTicket(res.ticket);
      showToast(
        `Berhasil memperbarui status tiket ${res.ticket.nomor_tiket} menjadi "${newStatus}"!`,
        'success'
      );
      setIsSubmitting(false);
    } catch {
      setErrorValidation('Terjadi gangguan jaringan atau server.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono font-medium">
          Memuat berkas investigasi tiket {ticketCode}...
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Tiket Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Kode tiket <strong>{ticketCode}</strong> tidak terdaftar dalam pangkalan data.
        </p>
        <Link
          href="/petugas/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Command Center</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/petugas/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Antrean Operasional</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">
            DOKUMEN PENANGANAN RESMI
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800">
            {ticket.nomor_tiket}
          </span>
        </div>
      </div>

      {/* ================= 2-COLUMN COMMAND CENTER LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= SISI KIRI (7 Cols): DETAIL KELUHAN & BUKTI ================= */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {ticket.nomor_tiket}
                  </h1>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kategori:{' '}
                  <span className="font-semibold text-slate-800">{ticket.kategori}</span>
                </p>
              </div>

              <div className="text-[11px] text-slate-500 font-mono self-start sm:self-auto space-y-0.5">
                <div>Waktu Masuk:</div>
                <div className="font-bold text-slate-700">
                  {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Reporter Profile Box with Privacy/Anonymous Indicator */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Data Identitas Pelapor
                </span>
                {ticket.is_anonim ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-slate-700" />
                    <span>Mode Anonim Aktif</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Sivitas Terverifikasi
                  </span>
                )}
              </div>

              {ticket.is_anonim ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    {ticket.nama_pelapor} (Identitas Dirahasiakan)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sistem melindungi privasi pelapor ini. Harap tangani aduan secara objektif tanpa mencari tahu identitas pribadi mahasiswa.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{ticket.nama_pelapor}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      NIM/ID: {ticket.pelapor_id || 'Tercatat dalam log auth'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lokasi Spesifik */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Titik Lokasi Kendala</span>
              </div>
              <p className="text-slate-800 font-semibold">{ticket.lokasi || 'Lingkungan Kampus'}</p>
            </div>

            {/* Deskripsi Keluhan Mahasiswa */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Rincian Deskripsi Aduan Mahasiswa
              </label>
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {ticket.deskripsi}
              </div>
            </div>

            {/* Foto Bukti Mahasiswa */}
            {ticket.lampiran_foto && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Foto Bukti Kerusakan dari Mahasiswa</span>
                </label>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-w-md">
                  <img
                    src={ticket.lampiran_foto}
                    alt="Bukti Aduan"
                    className="w-full h-auto max-h-72 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Audit Trail Penanganan */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Audit Trail Riwayat Penanganan</span>
              </h4>

              {ticket.riwayat && ticket.riwayat.length > 0 ? (
                <div className="space-y-2.5">
                  {ticket.riwayat.map((hist, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {hist.petugas} • {hist.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(hist.waktu).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {hist.catatan}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat penanganan tercatat.</p>
              )}
            </div>

            {/* Student Feedback if available */}
            {ticket.konfirmasi_selesai && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <span>Ulasan Kepuasan Mahasiswa</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= (ticket.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {ticket.feedback && (
                  <p className="text-slate-700 italic text-[11px]">
                    &quot;{ticket.feedback}&quot;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= SISI KANAN (5 Cols): PANEL AKSI PETUGAS ================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">PANEL AKSI PETUGAS</h3>
                  <p className="text-[10px] text-slate-400">Eksekusi Status & Catatan Teknis</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SOP AKTIF
              </span>
            </div>

            {errorValidation && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorValidation}</span>
              </div>
            )}

            <form onSubmit={handleExecuteStatusUpdate} className="space-y-4">
              {/* Status Radio Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Perbarui Status Tiket:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pending', 'Diproses', 'Selesai'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        newStatus === st
                          ? st === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-400 ring-2 ring-amber-200'
                            : st === 'Diproses'
                            ? 'bg-sky-50 text-sky-800 border-sky-400 ring-2 ring-sky-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Catatan Tindak Lanjut / Solusi */}
              <div className="space-y-1.5">
                <label htmlFor="catatanPetugas" className="text-xs font-bold text-slate-700 block">
                  Catatan Tindak Lanjut / Solusi Teknis <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="catatanPetugas"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  required
                  placeholder="Jelaskan tindakan teknisi yang telah atau sedang dilakukan..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400">
                  Catatan ini akan dapat dibaca langsung oleh mahasiswa pelapor.
                </p>
              </div>

              {/* Upload Foto Bukti Penyelesaian */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Unggah Foto Bukti Penyelesaian (Opsional):
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3.5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  {proofPhoto || ticket.bukti_penyelesaian ? (
                    <div className="space-y-2">
                      <img
                        src={proofPhoto || ticket.bukti_penyelesaian || ''}
                        alt="Bukti Penyelesaian"
                        className="rounded-lg max-h-36 mx-auto object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setProofPhoto(null)}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Ganti Foto Bukti
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-1 block">
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-xs font-bold text-amber-700 block">
                        Pilih foto penyelesaian
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        PNG / JPG / WEBP maksimal 3MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Execution Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menerapkan Status...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Terapkan & Simpan Perubahan</span>
                  </>
                )}
              </button>
            </form>

            {/* SOP Compliance Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 block text-[10px] uppercase">
                Standar Operasional Prosedur (SOP):
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Ubah ke &quot;Diproses&quot; saat teknisi sudah menuju lokasi.</li>
                <li>Ubah ke &quot;Selesai&quot; setelah kendala fisik teratasi sepenuhnya.</li>
                <li>Sertakan bukti foto perbaikan untuk transparansi akuntabilitas.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
