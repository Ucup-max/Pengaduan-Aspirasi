'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MahasiswaSidebar } from '@/components/layout/MahasiswaSidebar';
import { MahasiswaHeader } from '@/components/layout/MahasiswaHeader';
import { HelpModal } from '@/components/auth/HelpModal';
import { UserAccount } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push('/login');
        } else if (data.user.role === 'dosen') {
          // Petugas/Dosen diarahkan ke Command Center mereka
          router.push('/petugas/dashboard');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari sesi mahasiswa.', 'info');
    router.push('/login');
    router.refresh();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/aspirasi/riwayat?ticket=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen w-full bg-[#f8fafc] text-slate-800">
      {/* Sidebar Mahasiswa */}
      <MahasiswaSidebar
        user={user}
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <MahasiswaHeader
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
