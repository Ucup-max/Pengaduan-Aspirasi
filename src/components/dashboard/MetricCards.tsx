import React from 'react';
import { FileText, Clock, CheckCircle2, Zap } from 'lucide-react';
import { TicketStats } from '@/types';

interface MetricCardsProps {
  stats: TicketStats;
}

export function MetricCards({ stats }: MetricCardsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Transparansi & Metrik Penanganan
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Pembaruan otomatis real-time</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Tiket */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Total Aspirasi</span>
            <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.total}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Laporan resmi masuk</p>
        </div>

        {/* Card 2: Diproses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Sedang Ditangani</span>
            <span className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 tracking-tight">
            {stats.diproses}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Dalam pengerjaan teknis</p>
        </div>

        {/* Card 3: Selesai */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Tuntas Diselesaikan</span>
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {stats.selesai}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Solusi terverifikasi</p>
        </div>

        {/* Card 4: SLA Waktu Tanggap */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Standar Waktu SLA</span>
            <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ≤ 24 Jam
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Respon awal help desk</p>
        </div>
      </div>
    </div>
  );
}
