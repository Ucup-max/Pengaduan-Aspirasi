'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, KeyRound } from 'lucide-react';

export function TicketTracker() {
  const router = useRouter();
  const [ticketNumber, setTicketNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = () => {
    setErrorMsg('');
    const cleaned = ticketNumber.trim().toUpperCase();

    if (!cleaned) {
      setErrorMsg('Masukkan nomor tiket Anda terlebih dahulu (contoh: ASP-000123).');
      return;
    }

    router.push(`/aspirasi/riwayat?ticket=${encodeURIComponent(cleaned)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  return (
    <div id="homeTicketTracker" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
              #
            </span>
            <span>Lacak Status Tiket Anda</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sudah pernah mengajukan aspirasi? Masukkan nomor tiket untuk melihat progres penanganan secara langsung.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 self-start sm:self-auto">
          FORMAT: ASP-XXXXXX
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
        <div className="relative flex-1 w-full">
          <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => {
              setTicketNumber(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik kode tiket, misal: ASP-000123"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 uppercase"
          />
        </div>
        <button
          type="button"
          onClick={handleLookup}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Periksa Status</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {errorMsg && (
        <p className="text-xs font-semibold text-rose-600 pt-0.5">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
