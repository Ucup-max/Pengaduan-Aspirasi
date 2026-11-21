'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, Wifi, GraduationCap, MapPin, ArrowRight } from 'lucide-react';

export function CategoryCards() {
  const router = useRouter();

  const categories = [
    {
      id: 'Sarana & Prasarana',
      title: 'Sarana & Prasarana',
      desc: 'AC rusak, proyektor mati, kursi kuliah, kelistrikan kelas.',
      icon: Building,
      hoverBorder: 'hover:border-indigo-400',
      iconBg: 'bg-indigo-50 text-indigo-600',
      actionText: 'text-indigo-600',
    },
    {
      id: 'Teknologi & Informasi',
      title: 'Teknologi & Informasi',
      desc: 'WiFi lambat/putus, server SIAKAD, lab komputer, email kampus.',
      icon: Wifi,
      hoverBorder: 'hover:border-sky-400',
      iconBg: 'bg-sky-50 text-sky-600',
      actionText: 'text-sky-600',
    },
    {
      id: 'Akademik',
      title: 'Layanan Akademik',
      desc: 'Verifikasi KRS, sinkronisasi nilai, jadwal ujian, dosen wali.',
      icon: GraduationCap,
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-600',
      actionText: 'text-emerald-600',
    },
    {
      id: 'Fasilitas Kampus',
      title: 'Fasilitas Kampus',
      desc: 'Sanitasi toilet, lift gedung kuliah, penerangan jalan, parkir.',
      icon: MapPin,
      hoverBorder: 'hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-600',
      actionText: 'text-amber-600',
    },
  ];

  const handleSelectCategory = (categoryId: string) => {
    router.push(`/aspirasi/buat?kategori=${encodeURIComponent(categoryId)}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pilih Kategori Kendala
          </h3>
        </div>
        <Link
          href="/aspirasi/buat"
          className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline"
        >
          Lihat Formulir Lengkap →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`bg-white rounded-2xl border border-slate-200 p-4 ${cat.hoverBorder} hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
              </div>
              <span
                className={`text-[10px] ${cat.actionText} font-bold mt-3 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform`}
              >
                <span>Lapor Kategori Ini</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
