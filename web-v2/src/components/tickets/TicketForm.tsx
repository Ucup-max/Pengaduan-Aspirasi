'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, MapPin, Upload, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserAccount } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { createTicketAction } from '@/app/actions/tickets';

interface TicketFormProps {
  user?: UserAccount | null;
  onSuccess?: (ticketNumber: string) => void;
}

export function TicketForm({ user, onSuccess }: TicketFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Generator ID Tiket Format ASP-XXXXXX
  const generateTicketId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ASP-${randomNum}`;
  };

  const [nomorTiket, setNomorTiket] = useState('');
  const [namaPelapor, setNamaPelapor] = useState('');
  const [kategori, setKategori] = useState('Fasilitas Kampus');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isAnonim, setIsAnonim] = useState(false);
  const [lampiranFoto, setLampiranFoto] = useState<string | null>(null);
  const [fotoInfo, setFotoInfo] = useState<{ name: string; size: string } | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNomorTiket(generateTicketId());

    if (user?.nama) {
      setNamaPelapor(user.nama);
    } else {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.nama) {
            setNamaPelapor(data.user.nama);
          }
        })
        .catch(() => {});
    }

    // Auto-select category if passed in searchParams
    const queryCategory = searchParams.get('kategori');
    if (queryCategory) {
      setKategori(queryCategory);
    }
  }, [user, searchParams]);

  // Handle Photo Select (Max 3MB, JPG/PNG/WebP)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationError('Format foto bukti harus berupa JPEG, PNG, atau WebP.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setValidationError('Ukuran foto bukti tidak boleh melebihi 3MB.');
      return;
    }

    setValidationError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setLampiranFoto(event.target?.result as string);
      setFotoInfo({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setLampiranFoto(null);
    setFotoInfo(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanDeskripsi = deskripsi.trim();
    const cleanNama = namaPelapor.trim();
    const cleanLokasi = lokasi.trim();

    // Validasi TC-01 & Kontrak SKPL
    if (!cleanDeskripsi || cleanDeskripsi.length === 0) {
      setValidationError('Deskripsi wajib diisi');
      document.getElementById('deskripsi')?.focus();
      return;
    }

    if (cleanDeskripsi.length < 20) {
      setValidationError('Deskripsi wajib diisi - Berikan rincian laporan minimal 20 karakter.');
      document.getElementById('deskripsi')?.focus();
      return;
    }

    if (!cleanNama) {
      setValidationError('Nama pelapor wajib diisi');
      document.getElementById('nama_pelapor')?.focus();
      return;
    }

    if (!cleanLokasi) {
      setValidationError('Lokasi spesifik kendala wajib diisi (misal: Gedung F, Lantai 2).');
      document.getElementById('lokasi')?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      let createdTicket: any = null;
      let submitError = '';

      // Jalur 1: Eksekusi Next.js Server Action
      try {
        const result = await createTicketAction({
          nomor_tiket: nomorTiket,
          nama_pelapor: cleanNama,
          kategori,
          lokasi: cleanLokasi,
          deskripsi: cleanDeskripsi,
          is_anonim: isAnonim,
          lampiran_foto: lampiranFoto,
        });

        if (result?.success && result?.ticket) {
          createdTicket = result.ticket;
        } else {
          submitError = result?.error || '';
        }
      } catch (actionErr: any) {
        console.warn('Server Action createTicketAction gagal, mencoba fallback ke API route:', actionErr);
      }

      // Jalur 2: Fallback instan ke REST API jika Server Action terkendala di serverless
      if (!createdTicket) {
        try {
          const apiRes = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nomor_tiket: nomorTiket,
              nama_pelapor: isAnonim ? 'Sivitas Akademika (Anonim)' : cleanNama,
              kategori,
              lokasi: cleanLokasi,
              deskripsi: cleanDeskripsi,
              is_anonim: isAnonim,
              lampiran_foto: lampiranFoto,
              status: 'Pending',
            }),
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.ticket) {
              createdTicket = apiData.ticket;
            }
          } else {
            const errData = await apiRes.json().catch(() => ({}));
            submitError = errData.error || submitError || 'Gagal menyimpan aspirasi ke basis data.';
          }
        } catch (apiErr: any) {
          submitError = apiErr?.message || submitError || 'Gagal terhubung ke server.';
        }
      }

      if (!createdTicket) {
        setValidationError(submitError || 'Gagal menyimpan tiket aspirasi.');
        setIsSubmitting(false);
        return;
      }

      showToast(`Aspirasi ${createdTicket.nomor_tiket} berhasil diajukan!`, 'success');

      if (onSuccess) {
        onSuccess(createdTicket.nomor_tiket);
      } else {
        router.push(`/aspirasi/riwayat?ticket=${encodeURIComponent(createdTicket.nomor_tiket)}&recent=1`);
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Terjadi kesalahan sistem saat mengirim aspirasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charLength = deskripsi.trim().length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Data Pengajuan Aspirasi</h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          FORMULIR TIKET RESMI
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Field 1: Nomor Tiket Resmi */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="nomor_tiket" className="text-xs font-bold text-slate-700">
              Nomor Tiket <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setNomorTiket(generateTicketId())}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Perbarui ID</span>
            </button>
          </div>
          <input
            type="text"
            id="nomor_tiket"
            name="nomor_tiket"
            value={nomorTiket}
            readOnly
            className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 text-indigo-950 cursor-not-allowed select-all"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Identitas nomor tiket resmi diterbitkan otomatis oleh sistem sebagai rujukan penanganan.
          </p>
        </div>

        {/* Field 2: Nama Pelapor */}
        <div>
          <label htmlFor="nama_pelapor" className="block text-xs font-bold text-slate-700 mb-1.5">
            Nama Pelapor <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="nama_pelapor"
            name="nama_pelapor"
            value={namaPelapor}
            onChange={(e) => setNamaPelapor(e.target.value)}
            placeholder="Masukkan nama lengkap Anda..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Gunakan nama yang sesuai dengan data mahasiswa atau kartu identitas kampus.
          </p>
        </div>

        {/* Field 3: Kategori Pengaduan */}
        <div>
          <label htmlFor="kategori" className="block text-xs font-bold text-slate-700 mb-1.5">
            Kategori <span className="text-rose-500">*</span>
          </label>
          <select
            id="kategori"
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white font-medium"
          >
            <option value="Fasilitas Kampus">Fasilitas Kampus</option>
            <option value="Sarana & Prasarana">Sarana & Prasarana</option>
            <option value="Teknologi & Informasi">Teknologi & Informasi</option>
            <option value="Layanan Administrasi">Layanan Administrasi</option>
            <option value="Akademik">Akademik</option>
            <option value="Finansial">Finansial</option>
            <option value="Lainnya">Lainnya</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Pilih rumpun aduan agar dialokasikan ke unit kerja teknis yang berwenang.
          </p>
        </div>

        {/* Field 4: Lokasi Spesifik */}
        <div>
          <label htmlFor="lokasi" className="block text-xs font-bold text-slate-700 mb-1.5">
            Lokasi Spesifik <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="lokasi"
              name="lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Gedung F, Lantai 2, Ruang F2.01"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sebutkan gedung, lantai, atau ruangan spesifik agar teknisi mudah menemukan lokasi kendala.
          </p>
        </div>

        {/* Field 5: Rincian Deskripsi & Counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="deskripsi" className="text-xs font-bold text-slate-700">
              Rincian Aspirasi <span className="text-rose-500">*</span>
            </label>
            <span
              id="charCount"
              className={`text-[11px] font-mono ${
                charLength >= 20 ? 'text-emerald-600 font-bold' : 'text-slate-400'
              }`}
            >
              {charLength} / min. 20 karakter
            </span>
          </div>
          <textarea
            id="deskripsi"
            name="deskripsi"
            rows={4}
            value={deskripsi}
            onChange={(e) => {
              setDeskripsi(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Tuliskan kendala secara rinci, kronologi permasalahan, atau ide perbaikan (minimal 20 karakter)..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 leading-relaxed"
          />

          {/* Validation Error Alert (TC-01) */}
          {validationError && (
            <div
              id="validationErrorBox"
              className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-semibold" id="validationErrorMessage">
                {validationError}
              </span>
            </div>
          )}
        </div>

        {/* Field 6: Lampiran Foto Bukti (Dropzone) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Lampiran Foto Bukti (Opsional)
            </label>
            <span className="text-[11px] text-slate-400">JPG, PNG, WebP (Maks 3MB)</span>
          </div>

          {!lampiranFoto ? (
            <div
              onClick={() => document.getElementById('lampiran_foto')?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60 rounded-2xl p-4 text-center cursor-pointer transition-all group"
            >
              <input
                type="file"
                id="lampiran_foto"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Klik untuk mengunggah foto bukti kendala
                </p>
                <p className="text-[11px] text-slate-400">
                  Dukungan format foto JPEG, PNG, atau WebP hingga 3MB
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={lampiranFoto}
                  alt="Preview Bukti"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                />
                <div className="text-xs truncate">
                  <p className="font-bold text-slate-800 truncate">{fotoInfo?.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{fotoInfo?.size}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>

        {/* Field 7: Checkbox Kirim Sebagai Anonim */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
          <div className="space-y-0.5 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Kirim sebagai Anonim</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                Privasi Pelapor
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nama Anda akan disamarkan sebagai{' '}
              <strong className="text-slate-700">"Sivitas Akademika (Anonim)"</strong> di antrean publik & petugas.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              id="is_anonim"
              checked={isAnonim}
              onChange={(e) => setIsAnonim(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ← Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan ke Supabase...</span>
              </>
            ) : (
              <span>Kirim Aspirasi →</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
