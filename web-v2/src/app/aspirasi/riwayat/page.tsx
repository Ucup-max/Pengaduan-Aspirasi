'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { HelpModal } from '@/components/auth/HelpModal';
import { UserAccount, Ticket } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, Plus, Inbox, Layers } from 'lucide-react';
import Link from 'next/link';
import { confirmTicketResolutionAction, reopenTicketAction } from '@/app/actions/tickets';

function RiwayatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const targetTicketQuery = searchParams.get('ticket');
  const isRecent = searchParams.get('recent') === '1';

  // 1. Fetch Auth & Tickets
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/login?redirect=/aspirasi/riwayat');
        }
      })
      .catch(() => router.push('/login'));

    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          const list: Ticket[] = data.tickets;
          setTickets(list);

          if (targetTicketQuery) {
            const found = list.find(
              (t) => t.nomor_tiket.toLowerCase() === targetTicketQuery.toLowerCase()
            );
            if (found) {
              setSelectedTicket(found);
            } else if (list.length > 0) {
              setSelectedTicket(list[0]);
              showToast(`Nomor tiket ${targetTicketQuery} tidak ditemukan. Menampilkan tiket pertama.`, 'info');
            }
          } else if (list.length > 0) {
            setSelectedTicket(list[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [router, targetTicketQuery, showToast]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari akun.', 'info');
    router.push('/login');
    router.refresh();
  };

  // Confirm Finish (Rating) via Server Action
  const handleConfirmFinish = async (
    ticketId: number | string,
    rating: number,
    feedback: string
  ) => {
    try {
      await confirmTicketResolutionAction({
        ticketId,
        rating,
        feedback,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId || t.nomor_tiket === ticketId
            ? { ...t, konfirmasi_selesai: true, rating, feedback }
            : t
        )
      );
      if (selectedTicket && (selectedTicket.id === ticketId || selectedTicket.nomor_tiket === ticketId)) {
        setSelectedTicket({
          ...selectedTicket,
          konfirmasi_selesai: true,
          rating,
          feedback,
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Reopen Ticket via Server Action
  const handleReopenTicket = async (ticketId: number | string, reason: string) => {
    try {
      const result = await reopenTicketAction({
        ticketId,
        reason,
      });

      if (result.success && result.ticket) {
        setTickets((prev) =>
          prev.map((t) =>
            t.nomor_tiket === result.ticket!.nomor_tiket
              ? result.ticket!
              : t
          )
        );
        setSelectedTicket(result.ticket);
      }
    } catch (e) {
      console.warn(e);
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

        <main className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Top Header Success / Status Indicator */}
          <div className="text-center pt-2 pb-2 space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isRecent ? 'Aspirasi Berhasil Dikirim' : 'Nomor Tiket & Status Aspirasi'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRecent
                ? 'Laporan Anda telah berhasil dicatat dalam antrean penanganan sistem.'
                : 'Pantau transparansi progres dan catatan tindak lanjut laporan Anda.'}
            </p>
          </div>

          {/* Daftar Seluruh Tiket Aspirasi Mahasiswa (Multi-Ticket Support) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Daftar Tiket Aspirasi</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tickets.length} Tiket
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pilih salah satu kartu di bawah untuk meninjau rincian & status terkini.
                  </p>
                </div>
              </div>
              <Link
                href="/aspirasi/buat"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Buat Aspirasi Baru</span>
              </Link>
            </div>

            {/* Grid Kartu Tiket */}
            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tickets.map((t) => (
                  <TicketCard
                    key={t.id || t.nomor_tiket}
                    ticket={t}
                    isSelected={selectedTicket?.nomor_tiket === t.nomor_tiket}
                    onClick={() => setSelectedTicket(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 space-y-3">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Belum Ada Tiket yang Dikirim</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Anda belum mengajukan aspirasi apa pun. Ajukan laporan pertama Anda sekarang.
                  </p>
                </div>
                <Link
                  href="/aspirasi/buat"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Aspirasi Baru</span>
                </Link>
              </div>
            )}
          </div>

          {/* Rincian Tiket Terpilih */}
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onConfirmFinish={handleConfirmFinish}
              onReopenTicket={handleReopenTicket}
            />
          )}
        </main>

        <Footer />
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat riwayat tiket...</div>}>
      <RiwayatContent />
    </Suspense>
  );
}
