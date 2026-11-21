import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Aspirasi Mahasiswa - Portal Pengaduan Kampus',
  description: 'Sistem Aspirasi Mahasiswa v2.1 terintegrasi Supabase & Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
