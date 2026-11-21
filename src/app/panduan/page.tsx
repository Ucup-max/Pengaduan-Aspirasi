'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UserAccount } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { BookOpen, ShieldCheck, Clock, FileText } from 'lucide-react';

function PanduanContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push('/login?redirect=/panduan');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari akun.', 'info');
    router.push('/login');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen w-full">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header user={user} onLogout={handleLogout} />
        <main className="p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Panduan & Standar Operasional Prosedur (SOP)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Tata kelola dan alur penanganan laporan aspirasi mahasiswa kampus.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>1. Siklus Penanganan Aduan (SLA Maksimal 24 Jam)</span>
              </h3>
              <p className="leading-relaxed text-slate-600">
                Laporan yang dikirimkan berstatus <strong>Pending</strong>. Tim teknisi akan memeriksa dan memperbarui status menjadi <strong>Diproses</strong> saat penanganan lapangan dimulai.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>2. Jaminan Kerahasiaan (Fitur Pelapor Anonim)</span>
              </h3>
              <p className="leading-relaxed text-slate-600">
                Pelapor dapat mengaktifkan opsi <em>Kirim sebagai Anonim</em>. Identitas asli tetap tersimpan secara aman di pangkalan data terenkripsi namun disamarkan sebagai <strong>Sivitas Akademika (Anonim)</strong> pada antrean publik.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function PanduanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat panduan...</div>}>
      <PanduanContent />
    </Suspense>
  );
}
