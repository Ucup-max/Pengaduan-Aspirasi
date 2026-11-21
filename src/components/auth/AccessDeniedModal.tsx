'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessDeniedModal({ isOpen, onClose }: AccessDeniedModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Akses Ditolak (HTTP 403)"
      subtitle="Role-Based Access Control (RBAC)"
    >
      <div className="space-y-4 text-slate-700 text-xs">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Halaman Terproteksi Khusus Dosen / Petugas</p>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Akun Anda saat ini memiliki peran <strong>Mahasiswa</strong>. Fitur pengelolaan status dan antrean aspirasi seluruh kampus hanya dapat diakses oleh akun <strong>Dosen</strong>.
            </p>
          </div>
        </div>

        <p className="text-slate-500 leading-relaxed text-[11px]">
          Untuk menguji fitur ini, silakan keluar lalu masuk menggunakan akun Dosen (contoh: NIM <strong>260102037</strong> - Yusuf Anggit Prasetyo).
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-all shadow-xs"
        >
          Mengerti, Kembali ke Beranda
        </button>
      </div>
    </Modal>
  );
}
