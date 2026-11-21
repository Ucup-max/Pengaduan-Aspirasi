'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { HelpModal } from '@/components/auth/HelpModal';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeRoleTab, setActiveRoleTab] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('NIM / Username dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Gagal masuk. Periksa kembali kredensial Anda.');
        setIsLoading(false);
        return;
      }

      showToast(`Selamat datang kembali, ${data.user.nama}!`, 'success');
      const targetDestination = data.redirect || (data.user.role === 'dosen' ? '/petugas/dashboard' : '/dashboard');
      router.push(targetDestination);
      router.refresh();
    } catch {
      setErrorMessage('Terjadi gangguan jaringan atau server. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#081120] text-slate-800">
      {/* ================= LEFT PANEL: HERO BRANDING & SCHEMA VISUAL ================= */}
      <div className="lg:w-1/2 p-8 lg:p-14 bg-gradient-to-br from-[#0c182c] via-[#091222] to-[#040913] text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Subtle background grid effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Top Badge */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-widest text-blue-400 uppercase">
                PORTAL PENGADUAN • ASPIRASI KAMPUS
              </div>
              <div className="text-xs text-slate-400 font-medium">Sistem Aspirasi Mahasiswa v2.1</div>
            </div>
          </div>
        </div>

        {/* Center Hero Headline & Schema Cards */}
        <div className="relative z-10 my-8 lg:my-0 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Suarakan aspirasi.<br />
            Wujudkan perubahan<br />
            kampus lebih baik.
          </h1>
          <p className="text-slate-300/80 text-sm sm:text-base max-w-lg leading-relaxed">
            Layanan resmi penyampaian aspirasi dan pengaduan sivitas kampus. Sampaikan laporan, pantau
            transparansi progres penanganan secara akuntabel, dan pastikan setiap suara mendapatkan
            tindak lanjut nyata.
          </p>

          {/* Schema preview visual cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs text-[11px] font-mono space-y-2">
              <div className="flex items-center justify-between text-blue-400 border-b border-slate-800 pb-1.5 font-bold">
                <span>mahasiswa</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">TABLE</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span className="text-white">nim</span>
                  <span className="text-[10px] text-amber-400">PRIMARY KEY</span>
                </div>
                <div>nama</div>
                <div>kelas</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs text-[11px] font-mono space-y-2">
              <div className="flex items-center justify-between text-emerald-400 border-b border-slate-800 pb-1.5 font-bold">
                <span>aspirasi</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">TABLE</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span className="text-white">id_tiket</span>
                  <span className="text-[10px] text-amber-400">PRIMARY KEY</span>
                </div>
                <div className="flex justify-between">
                  <span>nim</span>
                  <span className="text-[10px] text-sky-400">→ mahasiswa</span>
                </div>
                <div>status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Notice */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-slate-800/60">
          <span>© 2026 Portal Aspirasi Mahasiswa v2.1</span>
          <span>Terproteksi RBAC & Pangkalan Data</span>
        </div>
      </div>

      {/* ================= RIGHT PANEL: CLEAN LOGIN FORM ================= */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 bg-white flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Header Titles */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
              PORTAL LAYANAN MAHASISWA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke Portal Aspirasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Gunakan akun resmi kampus Anda untuk menyampaikan atau mengelola aspirasi.
            </p>
          </div>

          {/* Role Tabs Switcher: [ 🎓 Mahasiswa ] [ 📖 Dosen ] */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('mahasiswa');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-xs ${
                activeRoleTab === 'mahasiswa'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎓</span>
              <span>Mahasiswa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('dosen');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-xs ${
                activeRoleTab === 'dosen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📖</span>
              <span>Dosen</span>
            </button>
          </div>

          {/* Error Notification Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Gagal Masuk:</span>
                <span className="ml-1">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="loginUsername" className="block text-xs font-semibold text-slate-700">
                {activeRoleTab === 'dosen' ? 'NIM / Kode Dosen' : 'Nomor Induk Mahasiswa'}
              </label>
              <input
                type="text"
                id="loginUsername"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                placeholder={
                  activeRoleTab === 'dosen'
                    ? 'Contoh: 260102037'
                    : 'Contoh: 260302026'
                }
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-700">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk →</span>
              )}
            </button>
          </form>

          {/* Help & Operational Info */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2 text-slate-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Hak akses fitur mengikuti peran akun Anda (Mahasiswa / Dosen).<br />
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer mt-0.5 inline-block"
                >
                  Kendala masuk? Pusat Bantuan & Kontak Helpdesk
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
