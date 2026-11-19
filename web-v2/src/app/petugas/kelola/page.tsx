'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StaffQueueTable } from '@/components/staff/StaffQueueTable';
import { HelpModal } from '@/components/auth/HelpModal';
import { UserAccount, Ticket, TicketStatus } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { ListOrdered, ShieldCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { updateTicketStatusAction } from '@/app/actions/tickets';

function KelolaPetugasContent() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Verify User & RBAC Dosen Role
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push('/login?redirect=/petugas/kelola');
        } else if (data.user.role !== 'dosen') {
          // Defense in depth RBAC check
          router.push('/dashboard?access_denied=403');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));

    // 2. Fetch Tickets for Queue
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          setTickets(data.tickets);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari akun.', 'info');
    router.push('/login');
    router.refresh();
  };

  // Update Status Handler via Server Action
  const handleUpdateTicketStatus = async (
    ticketId: number | string,
    newStatus: TicketStatus,
    catatan: string
  ) => {
    try {
      const result = await updateTicketStatusAction({
        ticketId,
        newStatus,
        catatan,
      });

      if (!result.success || !result.ticket) {
        showToast(result.error || 'Gagal memperbarui status tiket.', 'error');
        throw new Error(result.error || 'Update failed');
      }

      setTickets((prev) =>
        prev.map((t) => (t.nomor_tiket === result.ticket!.nomor_tiket ? result.ticket! : t))
      );

      showToast(`Status tiket berhasil diubah menjadi "${newStatus}"!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui status tiket. Periksa koneksi.', 'error');
      throw err;
    }
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

        <main className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header Title & Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                PORTAL LAYANAN MAHASISWA &nbsp;/&nbsp;{' '}
                <span className="text-amber-600 font-bold">PORTAL PETUGAS (DOSEN)</span>
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <ListOrdered className="w-6 h-6 text-amber-600" />
                <span>Antrean Aspirasi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar aspirasi aktif dan riwayat penanganan tiket kampus yang terdaftar di basis data sistem.
              </p>
            </div>
            <Link
              href="/aspirasi/buat"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Aspirasi Baru</span>
            </Link>
          </div>

          {/* Banner Status Dosen Aktif */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
              📖
            </div>
            <div>
              <p className="font-bold">Mode Otoritas Dosen (Akses Penuh Antrean Seluruh Kampus)</p>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                Anda memiliki wewenang untuk meninjau aspirasi seluruh mahasiswa, mengubah status penanganan (Pending → Diproses → Selesai), dan memberikan catatan solusi teknis langsung.
              </p>
            </div>
          </div>

          {/* Table Antrean Aspirasi Modular */}
          <StaffQueueTable
            tickets={tickets}
            onUpdateTicketStatus={handleUpdateTicketStatus}
          />
        </main>

        <Footer />
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default function KelolaPetugasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat portal antrean...</div>}>
      <KelolaPetugasContent />
    </Suspense>
  );
}
