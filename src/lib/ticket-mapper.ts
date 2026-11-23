import { Ticket, TicketHistoryItem } from '@/types';

/**
 * Helper Mapper: Mengonversi baris tabel Supabase ke objek Ticket lengkap.
 * Mampu mengekstrak metadata dari kolom mandiri MAUPUN dari deskripsi jika kolom tambahan belum di-migrasi.
 */
export function mapRowToTicket(row: any): Ticket {
  let deskripsi = row.deskripsi || '';
  let lokasi = row.lokasi || '';
  let lampiran_foto = row.lampiran_foto || null;
  let is_anonim = !!row.is_anonim;
  let catatan_penanganan = row.catatan_penanganan || '';
  let bukti_penyelesaian = row.bukti_penyelesaian || null;

  // Ekstrak metadata yang tertanam di deskripsi jika tabel Supabase hanya memiliki skema core
  const lokasiMatch = deskripsi.match(/^\[Lokasi:\s*([^\]]+)\]\s*/i);
  if (lokasiMatch) {
    if (!lokasi) lokasi = lokasiMatch[1].trim();
    deskripsi = deskripsi.replace(/^\[Lokasi:\s*([^\]]+)\]\s*/i, '');
  }

  const anonimMatch = deskripsi.match(/\[Mode:\s*Anonim\]\s*/i);
  if (anonimMatch) {
    is_anonim = true;
    deskripsi = deskripsi.replace(/\[Mode:\s*Anonim\]\s*/i, '');
  }

  const lampiranMatch = deskripsi.match(/\[Lampiran:\s*([^\]]+)\]\s*/i);
  if (lampiranMatch) {
    if (!lampiran_foto) lampiran_foto = lampiranMatch[1].trim();
    deskripsi = deskripsi.replace(/\[Lampiran:\s*([^\]]+)\]\s*/i, '');
  }

  const buktiMatch = deskripsi.match(/\[Bukti Selesai:\s*([^\]]+)\]\s*/i);
  if (buktiMatch) {
    if (!bukti_penyelesaian) bukti_penyelesaian = buktiMatch[1].trim();
    deskripsi = deskripsi.replace(/\[Bukti Selesai:\s*([^\]]+)\]\s*/i, '');
  }

  const catatanMatch = deskripsi.match(/\[Catatan Petugas:\s*([^\]]+)\]\s*/i);
  if (catatanMatch) {
    if (!catatan_penanganan) catatan_penanganan = catatanMatch[1].trim();
    deskripsi = deskripsi.replace(/\[Catatan Petugas:\s*([^\]]+)\]\s*/i, '');
  }

  if (row.nama_pelapor?.includes('Anonim')) {
    is_anonim = true;
  }

  if (!lokasi) lokasi = 'Lingkungan Kampus';

  const defaultRiwayat: TicketHistoryItem[] = [
    {
      status: row.status || 'Pending',
      waktu: row.created_at || new Date().toISOString(),
      catatan: row.status === 'Pending' ? 'Aspirasi resmi diajukan dan masuk ke antrean helpdesk.' : 'Status tiket diperbarui.',
      petugas: 'Sistem',
    },
  ];

  return {
    id: row.id,
    nomor_tiket: row.nomor_tiket,
    nama_pelapor: row.nama_pelapor,
    nama_asli: row.nama_pelapor,
    pelapor_id: row.pelapor_id || '',
    is_anonim,
    kategori: row.kategori,
    lokasi,
    deskripsi: deskripsi.trim(),
    status: row.status || 'Pending',
    lampiran_foto,
    catatan_penanganan,
    bukti_penyelesaian,
    created_at: row.created_at,
    riwayat: Array.isArray(row.riwayat) && row.riwayat.length > 0 ? row.riwayat : defaultRiwayat,
    konfirmasi_selesai: !!row.konfirmasi_selesai,
    rating: row.rating || null,
    feedback: row.feedback || '',
  };
}
