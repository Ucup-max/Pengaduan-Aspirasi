'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PetugasSidebar } from '@/components/layout/PetugasSidebar';
import { PetugasHeader } from '@/components/layout/PetugasHeader';
import { HelpModal } from '@/components/auth/HelpModal';
import { UserAccount } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function PetugasLayout({
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
          router.push('/login?redirect=/petugas/dashboard');
        } else if (data.user.role !== 'dosen' && data.user.role !== 'petugas') {
          // Mahasiswa dilarang masuk ke Command Center Petugas
          router.push('/dashboard?access_denied=403');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Berhasil keluar dari akun petugas.', 'info');
    router.push('/login');
    router.refresh();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/petugas/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen w-full bg-[#f1f5f9] text-slate-900">
      {/* Sidebar Command Center Petugas */}
      <PetugasSidebar
        user={user}
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <PetugasHeader
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Help / SOP Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
