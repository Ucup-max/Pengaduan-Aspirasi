import React from 'react';
import { Ticket } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { MapPin, Calendar } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  isSelected?: boolean;
  onClick?: () => void;
}

export function TicketCard({ ticket, isSelected, onClick }: TicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-bold text-xs text-slate-900 block">
            {ticket.nomor_tiket}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block truncate max-w-[160px]">
            {ticket.kategori}
          </span>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {ticket.deskripsi}
      </p>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1 truncate max-w-[120px]">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{ticket.lokasi || 'Kampus'}</span>
        </span>
        <span className="flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span>
            {new Date(ticket.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </span>
      </div>
    </div>
  );
}
