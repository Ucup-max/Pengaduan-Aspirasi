import React from 'react';
import { Clock, Wrench, CheckCircle2 } from 'lucide-react';
import { TicketStatus } from '@/types';

interface StatusStepperProps {
  status: TicketStatus;
}

export function StatusStepper({ status }: StatusStepperProps) {
  const isPending = status === 'Pending';
  const isDiproses = status === 'Diproses';
  const isSelesai = status === 'Selesai';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-800">Tahapan Penanganan</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
          ESTIMASI 1-3 HARI KERJA
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        {/* Step 1: Pending */}
        <div
          className={`flex flex-col items-center transition-all duration-200 ${
            isPending || isDiproses || isSelesai ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-xs transition-colors ${
              isPending
                ? 'bg-slate-900 text-amber-400 ring-2 ring-amber-400/30'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isPending ? (
              <Clock className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-900">Pending</span>
          <span
            className={`text-[10px] font-semibold mt-0.5 ${
              isPending ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {isPending ? 'Tahap Aktif' : 'Terverifikasi'}
          </span>
        </div>

        {/* Step 2: Diproses */}
        <div
          className={`flex flex-col items-center transition-all duration-200 ${
            isDiproses || isSelesai ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
              isDiproses
                ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-400/30'
                : isSelesai
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200/60'
            }`}
          >
            {isSelesai ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Wrench className="w-4 h-4" />
            )}
          </div>
          <span
            className={`text-xs ${
              isDiproses ? 'font-bold text-slate-900' : isSelesai ? 'font-semibold text-slate-700' : 'font-medium text-slate-400'
            }`}
          >
            Diproses
          </span>
          <span
            className={`text-[10px] mt-0.5 ${
              isDiproses
                ? 'font-bold text-sky-600'
                : isSelesai
                ? 'text-emerald-600 font-semibold'
                : 'text-slate-300'
            }`}
          >
            {isDiproses ? 'Dalam Pengerjaan' : isSelesai ? 'Selesai Dikerjakan' : 'Pemeriksaan'}
          </span>
        </div>

        {/* Step 3: Selesai */}
        <div
          className={`flex flex-col items-center transition-all duration-200 ${
            isSelesai ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
              isSelesai
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/30'
                : 'bg-slate-100 text-slate-400 border border-slate-200/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span
            className={`text-xs ${
              isSelesai ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
            }`}
          >
            Selesai
          </span>
          <span
            className={`text-[10px] mt-0.5 ${
              isSelesai ? 'font-bold text-emerald-600' : 'text-slate-300'
            }`}
          >
            {isSelesai ? 'Tuntas' : 'Penyelesaian'}
          </span>
        </div>
      </div>
    </div>
  );
}
