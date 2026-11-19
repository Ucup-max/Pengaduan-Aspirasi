'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TicketForm } from '@/components/tickets/TicketForm';
import { HelpModal } from '@/components/auth/HelpModal';
import { UserAccount } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Info } from 'lucide-react';

function BuatAspirasiContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/login?redirect=/aspirasi/buat');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari akun.', 'info');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen w-full">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header user={user} onLogout={handleLogout} />

        <main className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Breadcrumbs */}
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              PORTAL LAYANAN MAHASISWA &nbsp;/&nbsp;{' '}
              <span className="text-indigo-600 font-bold">FORMULIR PENGADUAN</span>
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Form Aspirasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sampaikan laporan atau aspirasi Anda secara teratur dan transparan.
            </p>
          </div>

          {/* Institutional Civic Notice Banner */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-blue-950">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white shrink-0 flex items-center justify-center shadow-xs">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-blue-900">Ketentuan Penyampaian Aspirasi</h3>
              <p className="text-blue-800/90 leading-relaxed">
                Aspirasi akan diverifikasi dalam 1x24 jam kerja. Pastikan data nomor tiket disimpan
                untuk pelacakan. Laporan yang diajukan bersifat objektif dan memuat rincian lokasi atau
                kendala yang jelas.
              </p>
            </div>
          </div>

          {/* Form Aspirasi Modular */}
          <TicketForm user={user} />

          {/* Disclaimer Footer */}
          <p className="text-[11px] text-center text-slate-400 pb-8">
            Sistem Informasi Pengaduan & Aspirasi Mahasiswa v2.1 • Data yang dikirimkan tunduk pada ketentuan kode etik kampus dan diawasi oleh tim penjaminan mutu.
          </p>
        </main>

        <Footer />
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
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
