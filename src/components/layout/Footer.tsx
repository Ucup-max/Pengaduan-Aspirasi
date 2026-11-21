import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white px-6 py-4 text-center text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <span>© 2026 Portal Aspirasi Mahasiswa v2.1 • Sistem Next.js & Supabase</span>
        <span className="text-slate-500 font-medium">Terproteksi RBAC & Pangkalan Data</span>
      </div>
    </footer>
  );
}
