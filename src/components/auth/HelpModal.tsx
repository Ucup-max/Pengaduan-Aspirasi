'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { MessageSquare, Mail, Building, Clock } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Bantuan & Kontak Helpdesk"
      subtitle="Kanal resmi bantuan login dan informasi layanan aspirasi kampus"
    >
      <div className="space-y-4 text-slate-700">
        {/* Jam Operasional */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Jam Operasional Helpdesk</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-blue-700 font-bold border border-blue-200">
              SLA ≤ 24 Jam
            </span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            <strong>Senin – Jumat:</strong> 08.00 – 16.00 WIB (Istirahat 12.00 – 13.00 WIB)
            <br />
            <strong>Sabtu & Minggu / Hari Libur:</strong> Pelayanan Tiket Darurat via Online
          </p>
        </div>

        {/* Kanal Kontak Langsung */}
        <div className="space-y-2.5 text-xs">
          <a
            href="https://wa.me/628888996653?text=Halo%20Helpdesk%20Portal%20Aspirasi%20Mahasiswa,%20saya%20membutuhkan%20bantuan%20terkait:"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                WA
              </span>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  WhatsApp Resmi Helpdesk
                </p>
                <p className="text-[11px] text-slate-500 font-mono">08888996653</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Kirim Pesan →
            </span>
          </a>

          <a
            href="mailto:aspirasimahasiswa@gmail.com?subject=Bantuan%20Akses%20Portal%20Aspirasi"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                EM
              </span>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                  Email Resmi Kampus
                </p>
                <p className="text-[11px] text-slate-500 font-mono">aspirasimahasiswa@gmail.com</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Kirim Email →
            </span>
          </a>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              GD
            </span>
            <div className="text-xs">
              <p className="font-bold text-slate-800">Sekretariat Layanan Terpadu</p>
              <p className="text-[11px] text-slate-500">
                Gedung Kuliah Bersama, Lantai 1 (Unit Helpdesk & TI)
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
          >
            Tutup Bantuan
          </button>
        </div>
      </div>
    </Modal>
  );
}
