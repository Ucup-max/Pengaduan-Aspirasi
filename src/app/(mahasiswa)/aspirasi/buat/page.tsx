'use client';

import React, { Suspense } from 'react';
import { TicketForm } from '@/components/tickets/TicketForm';
import { Info, Sparkles } from 'lucide-react';

function BuatAspirasiContent() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Pengajuan Aspirasi & Pengaduan Kampus</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Formulir Aspirasi Baru
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sampaikan kendala fasilitas, sistem informasi, atau perkuliahan Anda secara akuntabel dan transparan.
        </p>
      </div>

      {/* Institutional Civic Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-blue-950">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white shrink-0 flex items-center justify-center shadow-xs">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-900">
            Jaminan Hak Suara & Privasi Sivitas Akademika
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Setiap aduan yang masuk diverifikasi dalam waktu maksimal 24 jam kerja. Anda dapat mengaktifkan opsi <strong>Mode Anonim</strong> bila tidak ingin nama asli Anda terlihat oleh publik saat pelaporan.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <TicketForm />
    </div>
  );
}

export default function BuatAspirasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat formulir...</div>}>
      <BuatAspirasiContent />
    </Suspense>
  );
}
