'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerSessionUser } from '@/lib/auth-session';
import { Ticket, TicketStatus, TicketHistoryItem } from '@/types';
import { INITIAL_TICKETS } from '@/lib/constants';

// In-memory fallback cache for offline / demo workshop mode
let serverTicketCache: Ticket[] = [...INITIAL_TICKETS];

// Helper Sanitasi Anti-XSS (Kepatuhan SEC-01 & RULES.md)
function escapeHtml(unsafeStr: string): string {
  if (typeof unsafeStr !== 'string') return '';
  return unsafeStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 1. Pembuatan Kode Tiket Otomatis Berurutan (ASP-XXXXXX)
 */
export async function generateTicketIdAction(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('tickets')
      .select('nomor_tiket')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const lastTicket = data[0].nomor_tiket;
      const match = lastTicket.match(/ASP-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `ASP-${String(nextNum).padStart(6, '0')}`;
      }
    }
  } catch {
    // Fallback if network fails
  }

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ASP-${randomNum}`;
}

/**
 * 2. Unggah Foto Bukti ke Supabase Storage
 */
export async function uploadEvidencePhotoAction(
  base64Data: string,
  ticketNumber: string
): Promise<string | null> {
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return null;
  }

  try {
    const supabase = await createClient();
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `${ticketNumber}-${Date.now()}.${extension}`;

    // Upload to 'evidence' bucket in Supabase Storage
    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(`tickets/${fileName}`, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('evidence')
        .getPublicUrl(`tickets/${fileName}`);
      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn('Supabase storage upload fallback to data uri:', err);
  }

  return base64Data;
}

/**
 * 3. Pengajuan Form Aspirasi (Create Ticket dengan Validasi Ketat Sisi Server)
 */
export async function createTicketAction(payload: {
  nomor_tiket?: string;
  nama_pelapor: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  is_anonim?: boolean;
  lampiran_foto?: string | null;
}) {
  const user = await getServerSessionUser();

  // Validasi Input Ketat Sisi Server (TC-01 & RULES.md)
  const cleanDeskripsi = payload.deskripsi?.trim() || '';
  const cleanNama = payload.nama_pelapor?.trim() || '';
  const cleanLokasi = payload.lokasi?.trim() || '';
  const cleanKategori = payload.kategori?.trim() || 'Fasilitas Kampus';

  if (!cleanDeskripsi || cleanDeskripsi.length === 0) {
    return { success: false, error: 'Deskripsi wajib diisi' };
  }

  if (cleanDeskripsi.length < 20) {
    return {
      success: false,
      error: 'Deskripsi wajib diisi - Berikan rincian laporan minimal 20 karakter.',
    };
  }

  if (!cleanNama) {
    return { success: false, error: 'Nama pelapor wajib diisi' };
  }

  if (!cleanLokasi) {
    return { success: false, error: 'Lokasi spesifik wajib diisi agar memudahkan teknisi.' };
  }

  // Sanitasi Anti-XSS (SEC-01)
  const sanitizedDeskripsi = escapeHtml(cleanDeskripsi);
  const sanitizedNama = escapeHtml(cleanNama);
  const sanitizedLokasi = escapeHtml(cleanLokasi);

  const ticketNumber = payload.nomor_tiket || (await generateTicketIdAction());

  // Upload foto ke Supabase storage jika ada
  let uploadedPhotoUrl = null;
  if (payload.lampiran_foto) {
    uploadedPhotoUrl = await uploadEvidencePhotoAction(payload.lampiran_foto, ticketNumber);
  }

  const isAnonim = !!payload.is_anonim;
  const initialHistory: TicketHistoryItem[] = [
    {
      status: 'Pending',
      waktu: new Date().toISOString(),
      catatan: 'Aspirasi resmi diajukan dan masuk ke antrean helpdesk.',
      petugas: 'Sistem',
    },
  ];

  const newTicket: Ticket = {
    id: Date.now(),
    nomor_tiket: ticketNumber,
    nama_pelapor: isAnonim ? 'Sivitas Akademika (Anonim)' : sanitizedNama,
    nama_asli: sanitizedNama,
    pelapor_id: user?.nim || '',
    is_anonim: isAnonim,
    kategori: cleanKategori,
    lokasi: sanitizedLokasi,
    deskripsi: sanitizedDeskripsi,
    status: 'Pending',
    lampiran_foto: uploadedPhotoUrl,
    catatan_penanganan: '',
    created_at: new Date().toISOString(),
    riwayat: initialHistory,
    konfirmasi_selesai: false,
    rating: null,
    feedback: '',
  };

  // Simpan ke Supabase PostgreSQL tabel public.tickets
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        nomor_tiket: newTicket.nomor_tiket,
        nama_pelapor: newTicket.nama_pelapor,
        kategori: newTicket.kategori,
        deskripsi: newTicket.deskripsi,
        status: 'Pending',
        lokasi: newTicket.lokasi || null,
        is_anonim: newTicket.is_anonim,
        lampiran_foto: newTicket.lampiran_foto || null,
        catatan_penanganan: '',
        riwayat: newTicket.riwayat as any,
        konfirmasi_selesai: false,
      } as any)
      .select()
      .single();

    if (!error && data) {
      newTicket.id = (data as any).id;
    }
  } catch (err) {
    console.warn('Supabase insert fallback:', err);
  }

  // Update in-memory cache
  serverTicketCache = [newTicket, ...serverTicketCache.filter((t) => t.nomor_tiket !== newTicket.nomor_tiket)];

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/kelola');

  return { success: true, ticket: newTicket };
}

/**
 * 4. Pembaruan Status Tiket oleh Petugas (RBAC Server-Side: Dosen Only)
 */
export async function updateTicketStatusAction(payload: {
  ticketId: number | string;
  newStatus: TicketStatus;
  catatan: string;
}) {
  const user = await getServerSessionUser();

  // Validasi RBAC Sisi Server (Hanya Dosen yang berhak!)
  if (!user || user.role !== 'dosen') {
    return {
      success: false,
      error: 'Akses ditolak: Hanya petugas / Dosen yang berhak memperbarui status aduan (HTTP 403 Forbidden).',
    };
  }

  const cleanCatatan = payload.catatan?.trim() || '';
  if (!cleanCatatan) {
    return {
      success: false,
      error: 'Catatan Penanganan / Solusi wajib diisi sebelum memperbarui status tiket.',
    };
  }

  const validStatuses: TicketStatus[] = ['Pending', 'Diproses', 'Selesai'];
  if (!validStatuses.includes(payload.newStatus)) {
    return { success: false, error: 'Status tiket tidak valid.' };
  }

  const sanitizedCatatan = escapeHtml(cleanCatatan);

  // Cari tiket dari cache atau Supabase
  let currentTicket = serverTicketCache.find(
    (t) => t.id === Number(payload.ticketId) || t.nomor_tiket === payload.ticketId
  );

  const historyItem: TicketHistoryItem = {
    status: payload.newStatus,
    waktu: new Date().toISOString(),
    catatan: sanitizedCatatan,
    petugas: user.nama || 'Dosen Penanggung Jawab',
  };

  const updatedHistory = currentTicket ? [...(currentTicket.riwayat || []), historyItem] : [historyItem];

  try {
    const supabase = await createClient();
    const query = supabase
      .from('tickets')
      .update({
        status: payload.newStatus,
        catatan_penanganan: sanitizedCatatan,
        riwayat: updatedHistory as any,
      })
      .eq('nomor_tiket', currentTicket?.nomor_tiket || payload.ticketId);

    await query;
  } catch (err) {
    console.warn('Supabase status update fallback:', err);
  }

  if (currentTicket) {
    currentTicket.status = payload.newStatus;
    currentTicket.catatan_penanganan = sanitizedCatatan;
    currentTicket.riwayat = updatedHistory;
  }

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/kelola');

  return { success: true, ticket: currentTicket };
}

/**
 * 5. Konfirmasi Selesai & Rating oleh Pelapor
 */
export async function confirmTicketResolutionAction(payload: {
  ticketId: number | string;
  rating: number;
  feedback?: string;
}) {
  const user = await getServerSessionUser();
  const sanitizedFeedback = escapeHtml(payload.feedback?.trim() || '');

  try {
    const supabase = await createClient();
    await supabase
      .from('tickets')
      .update({
        konfirmasi_selesai: true,
        rating: payload.rating,
        feedback: sanitizedFeedback,
      })
      .eq('nomor_tiket', payload.ticketId);
  } catch (err) {
    console.warn('Supabase confirm finish fallback:', err);
  }

  const currentTicket = serverTicketCache.find(
    (t) => t.id === Number(payload.ticketId) || t.nomor_tiket === payload.ticketId
  );
  if (currentTicket) {
    currentTicket.konfirmasi_selesai = true;
    currentTicket.rating = payload.rating;
    currentTicket.feedback = sanitizedFeedback;
  }

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');

  return { success: true };
}

/**
 * 6. Laporkan Belum Selesai (Reopen Ticket)
 */
export async function reopenTicketAction(payload: {
  ticketId: number | string;
  reason: string;
}) {
  const user = await getServerSessionUser();
  const cleanReason = payload.reason?.trim() || '';

  if (!cleanReason) {
    return { success: false, error: 'Alasan belum selesai wajib diisi.' };
  }

  const sanitizedReason = escapeHtml(cleanReason);

  const currentTicket = serverTicketCache.find(
    (t) => t.id === Number(payload.ticketId) || t.nomor_tiket === payload.ticketId
  );

  const reopenHistoryItem: TicketHistoryItem = {
    status: 'Diproses',
    waktu: new Date().toISOString(),
    catatan: `[Laporan Dibuka Kembali oleh Pelapor]: ${sanitizedReason}`,
    petugas: user?.nama || 'Pelapor Mahasiswa',
  };

  const updatedHistory = currentTicket
    ? [...(currentTicket.riwayat || []), reopenHistoryItem]
    : [reopenHistoryItem];

  try {
    const supabase = await createClient();
    await supabase
      .from('tickets')
      .update({
        status: 'Diproses',
        konfirmasi_selesai: false,
        riwayat: updatedHistory as any,
      })
      .eq('nomor_tiket', currentTicket?.nomor_tiket || payload.ticketId);
  } catch (err) {
    console.warn('Supabase reopen fallback:', err);
  }

  if (currentTicket) {
    currentTicket.status = 'Diproses';
    currentTicket.konfirmasi_selesai = false;
    currentTicket.riwayat = updatedHistory;
  }

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/kelola');

  return { success: true, ticket: currentTicket };
}

/**
 * 7. Filter & Pengambilan Riwayat Tiket
 */
export async function getFilteredTicketsAction(filter?: {
  status?: TicketStatus | 'Semua';
  query?: string;
  pelaporId?: string;
}) {
  let result: Ticket[] = [];

  try {
    const supabase = await createClient();
    let q = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.status && filter.status !== 'Semua') {
      q = q.eq('status', filter.status);
    }

    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      result = data.map((row: any) => ({
        id: row.id,
        nomor_tiket: row.nomor_tiket,
        nama_pelapor: row.nama_pelapor,
        nama_asli: row.nama_pelapor,
        is_anonim: !!row.is_anonim,
        kategori: row.kategori,
        lokasi: row.lokasi || 'Lingkungan Kampus',
        deskripsi: row.deskripsi,
        status: row.status,
        lampiran_foto: row.lampiran_foto || null,
        catatan_penanganan: row.catatan_penanganan || '',
        created_at: row.created_at,
        riwayat: Array.isArray(row.riwayat) ? row.riwayat : [],
        konfirmasi_selesai: !!row.konfirmasi_selesai,
        rating: row.rating || null,
        feedback: row.feedback || '',
      }));
      serverTicketCache = result;
    } else {
      result = [...serverTicketCache];
    }
  } catch {
    result = [...serverTicketCache];
  }

  // Filter query jika ada
  if (filter?.query) {
    const search = filter.query.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.nomor_tiket.toLowerCase().includes(search) ||
        t.nama_pelapor.toLowerCase().includes(search) ||
        (t.lokasi && t.lokasi.toLowerCase().includes(search)) ||
        t.deskripsi.toLowerCase().includes(search) ||
        t.kategori.toLowerCase().includes(search)
    );
  }

  if (filter?.status && filter.status !== 'Semua') {
    result = result.filter((t) => t.status === filter.status);
  }

  return { tickets: result };
}
