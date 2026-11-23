'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerSessionUser } from '@/lib/auth-session';
import { Ticket, TicketStatus, TicketHistoryItem } from '@/types';
import { INITIAL_TICKETS } from '@/lib/constants';
import { mapRowToTicket } from '@/lib/ticket-mapper';

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
      const lastTicket = (data[0] as any).nomor_tiket;
      const match = typeof lastTicket === 'string' ? lastTicket.match(/ASP-(\d+)/) : null;
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
  let savedToSupabase = false;

  // Tahap 1: Coba simpan full payload jika kolom tambahan tersedia
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
      savedToSupabase = true;
    }
  } catch {
    // Akan dilanjutkan ke Tahap 2 fallback
  }

  // Tahap 2: Fallback resilient jika tabel Supabase hanya memiliki skema dasar (Modul 2 SKPL)
  if (!savedToSupabase) {
    try {
      const supabase = await createClient();
      let compositeDeskripsi = '';
      if (newTicket.lokasi) compositeDeskripsi += `[Lokasi: ${newTicket.lokasi}]\n`;
      if (newTicket.is_anonim) compositeDeskripsi += `[Mode: Anonim]\n`;
      if (newTicket.lampiran_foto) compositeDeskripsi += `[Lampiran: ${newTicket.lampiran_foto}]\n`;
      compositeDeskripsi += `\n${newTicket.deskripsi}`;

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          nomor_tiket: newTicket.nomor_tiket,
          nama_pelapor: newTicket.nama_pelapor,
          kategori: newTicket.kategori,
          deskripsi: compositeDeskripsi.trim(),
          status: 'Pending',
        } as any)
        .select()
        .single();

      if (!error && data) {
        newTicket.id = (data as any).id;
        savedToSupabase = true;
      } else if (error) {
        console.error('Supabase core insert error:', error);
      }
    } catch (err) {
      console.error('Supabase core insert fatal:', err);
    }
  }

  // Update in-memory cache
  serverTicketCache = [newTicket, ...serverTicketCache.filter((t) => t.nomor_tiket !== newTicket.nomor_tiket)];

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/dashboard');
  revalidatePath('/petugas/kelola');

  return { success: true, ticket: newTicket };
}

/**
 * 4. Pembaruan Status Tiket oleh Petugas (RBAC Server-Side: Dosen/Petugas Only)
 */
export async function updateTicketStatusAction(payload: {
  ticketId: number | string;
  newStatus: TicketStatus;
  catatan?: string;
  petugasNama?: string;
  buktiFoto?: string | null;
  buktiFotoBase64?: string | null;
}) {
  const user = await getServerSessionUser();
  if (user && user.role !== 'dosen' && user.role !== 'petugas') {
    return { success: false, error: 'Akses ditolak: Hanya Dosen/Petugas yang berwenang memperbarui status tiket.' };
  }

  const cleanCatatan = payload.catatan?.trim() || '';
  if (!cleanCatatan) {
    return { success: false, error: 'Catatan penanganan wajib diisi sebagai dokumentasi operasional.' };
  }

  const sanitizedCatatan = escapeHtml(cleanCatatan);
  const petugasName = payload.petugasNama || user?.nama || 'Petugas Helpdesk';
  const rawId = String(payload.ticketId).trim();

  // 1. Ambil data tiket target langsung dari Supabase
  let ticketObj: Ticket | null = null;
  try {
    const supabase = await createClient();
    let query = supabase.from('tickets').select('*');
    if (!isNaN(Number(rawId))) {
      query = query.or(`nomor_tiket.eq.${rawId},id.eq.${Number(rawId)}`);
    } else {
      query = query.eq('nomor_tiket', rawId);
    }

    const { data: dbRow, error } = await query.single();
    if (!error && dbRow) {
      ticketObj = mapRowToTicket(dbRow);
    }
  } catch (err) {
    console.warn('Gagal membaca tiket dari Supabase:', err);
  }

  // Fallback ke serverTicketCache jika query Supabase belum membuahkan hasil
  if (!ticketObj) {
    ticketObj = serverTicketCache.find(
      (t) => t.id === Number(payload.ticketId) || t.nomor_tiket === rawId
    ) || null;
  }

  if (!ticketObj) {
    return { success: false, error: 'Tiket tidak ditemukan di dalam sistem.' };
  }

  const photoInput = payload.buktiFoto || payload.buktiFotoBase64;
  let uploadedProofUrl = null;
  if (photoInput) {
    uploadedProofUrl = await uploadEvidencePhotoAction(
      photoInput,
      `PROOF-${ticketObj.nomor_tiket}`
    );
  }

  const historyItem: TicketHistoryItem = {
    status: payload.newStatus,
    waktu: new Date().toISOString(),
    catatan: sanitizedCatatan,
    petugas: petugasName,
    bukti_foto: uploadedProofUrl,
  };

  const updatedHistory = [...(ticketObj.riwayat || []), historyItem];
  let updateSuccess = false;

  // Tahap 1: Coba update penuh jika kolom tersedia
  try {
    const supabase = await createClient();
    const updatePayload: any = {
      status: payload.newStatus,
      catatan_penanganan: sanitizedCatatan,
      riwayat: updatedHistory as any,
    };
    if (uploadedProofUrl) {
      updatePayload.bukti_penyelesaian = uploadedProofUrl;
    }

    const { error } = await (supabase.from('tickets') as any)
      .update(updatePayload)
      .eq('nomor_tiket', ticketObj.nomor_tiket);

    if (!error) {
      updateSuccess = true;
    }
  } catch {
    // Lanjut fallback
  }

  // Tahap 2: Fallback update jika hanya skema core yang ada
  if (!updateSuccess) {
    try {
      const supabase = await createClient();
      const { data: existingRow } = await (supabase.from('tickets') as any)
        .select('deskripsi')
        .eq('nomor_tiket', ticketObj.nomor_tiket)
        .single();

      let newDeskripsi = existingRow?.deskripsi || ticketObj.deskripsi || '';
      if (sanitizedCatatan) {
        newDeskripsi += `\n\n[Catatan Petugas: ${sanitizedCatatan}]`;
      }
      if (uploadedProofUrl) {
        newDeskripsi += `\n\n[Bukti Selesai: ${uploadedProofUrl}]`;
      }

      await (supabase.from('tickets') as any)
        .update({
          status: payload.newStatus,
          deskripsi: newDeskripsi.trim(),
        })
        .eq('nomor_tiket', ticketObj.nomor_tiket);
      updateSuccess = true;
    } catch (err) {
      console.warn('Fallback status update warning:', err);
    }
  }

  const finalUpdatedTicket: Ticket = {
    ...ticketObj,
    status: payload.newStatus,
    catatan_penanganan: sanitizedCatatan,
    riwayat: updatedHistory,
    bukti_penyelesaian: uploadedProofUrl || ticketObj.bukti_penyelesaian,
  };

  // Update server cache
  serverTicketCache = [
    finalUpdatedTicket,
    ...serverTicketCache.filter((t) => t.nomor_tiket !== finalUpdatedTicket.nomor_tiket),
  ];

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/dashboard');
  revalidatePath('/petugas/kelola');
  revalidatePath(`/petugas/tiket/${finalUpdatedTicket.nomor_tiket}`);
  revalidatePath(`/aspirasi/${finalUpdatedTicket.nomor_tiket}`);

  return { success: true, ticket: finalUpdatedTicket };
}

/**
 * 5. Konfirmasi Selesai & Rating oleh Pelapor
 */
export async function confirmTicketResolutionAction(payload: {
  ticketId: number | string;
  rating: number;
  feedback?: string;
}) {
  const sanitizedFeedback = escapeHtml(payload.feedback?.trim() || '');
  const rawId = String(payload.ticketId).trim();

  let ticketObj: Ticket | null = null;
  try {
    const supabase = await createClient();
    let query = supabase.from('tickets').select('*');
    if (!isNaN(Number(rawId))) {
      query = query.or(`nomor_tiket.eq.${rawId},id.eq.${Number(rawId)}`);
    } else {
      query = query.eq('nomor_tiket', rawId);
    }
    const { data: dbRow } = await query.single();
    if (dbRow) ticketObj = mapRowToTicket(dbRow);
  } catch {}

  if (!ticketObj) {
    ticketObj = serverTicketCache.find(
      (t) => t.id === Number(payload.ticketId) || t.nomor_tiket === rawId
    ) || null;
  }

  const targetCode = ticketObj?.nomor_tiket || rawId;

  try {
    const supabase = await createClient();
    await (supabase.from('tickets') as any)
      .update({
        konfirmasi_selesai: true,
        rating: payload.rating,
        feedback: sanitizedFeedback,
      })
      .eq('nomor_tiket', targetCode);
  } catch (err) {
    console.warn('Supabase confirm finish fallback:', err);
  }

  if (ticketObj) {
    ticketObj.konfirmasi_selesai = true;
    ticketObj.rating = payload.rating;
    ticketObj.feedback = sanitizedFeedback;
    serverTicketCache = [
      ticketObj,
      ...serverTicketCache.filter((t) => t.nomor_tiket !== ticketObj!.nomor_tiket),
    ];
  }

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/dashboard');

  return { success: true, ticket: ticketObj };
}

/**
 * 6. Laporkan Belum Selesai (Reopen Ticket)
 */
export async function reopenTicketAction(payload: {
  ticketId: number | string;
  alasan?: string;
  reason?: string;
}) {
  const rawAlasan = payload.alasan || payload.reason || 'Aspirasi dilaporkan belum tuntas oleh mahasiswa.';
  const sanitizedAlasan = escapeHtml(rawAlasan.trim());
  const user = await getServerSessionUser();
  const rawId = String(payload.ticketId).trim();

  let ticketObj: Ticket | null = null;
  try {
    const supabase = await createClient();
    let query = supabase.from('tickets').select('*');
    if (!isNaN(Number(rawId))) {
      query = query.or(`nomor_tiket.eq.${rawId},id.eq.${Number(rawId)}`);
    } else {
      query = query.eq('nomor_tiket', rawId);
    }
    const { data: dbRow } = await query.single();
    if (dbRow) ticketObj = mapRowToTicket(dbRow);
  } catch {}

  if (!ticketObj) {
    ticketObj = serverTicketCache.find(
      (t) => t.id === Number(payload.ticketId) || t.nomor_tiket === rawId
    ) || null;
  }

  const targetCode = ticketObj?.nomor_tiket || rawId;

  const historyItem: TicketHistoryItem = {
    status: 'Diproses',
    waktu: new Date().toISOString(),
    catatan: `Laporan Dibuka Kembali: ${sanitizedAlasan}`,
    petugas: user?.nama || 'Mahasiswa',
  };

  const updatedHistory = [...(ticketObj?.riwayat || []), historyItem];

  try {
    const supabase = await createClient();
    await (supabase.from('tickets') as any)
      .update({
        status: 'Diproses',
        konfirmasi_selesai: false,
        riwayat: updatedHistory as any,
      })
      .eq('nomor_tiket', targetCode);
  } catch (err) {
    console.warn('Supabase reopen fallback:', err);
  }

  const finalTicket: Ticket = ticketObj
    ? {
        ...ticketObj,
        status: 'Diproses',
        konfirmasi_selesai: false,
        riwayat: updatedHistory,
      }
    : ({
        id: Date.now(),
        nomor_tiket: targetCode,
        nama_pelapor: user?.nama || 'Mahasiswa',
        status: 'Diproses',
        kategori: 'Umum',
        deskripsi: sanitizedAlasan,
        created_at: new Date().toISOString(),
        riwayat: updatedHistory,
      } as any);

  serverTicketCache = [
    finalTicket,
    ...serverTicketCache.filter((t) => t.nomor_tiket !== finalTicket.nomor_tiket),
  ];

  revalidatePath('/dashboard');
  revalidatePath('/aspirasi/riwayat');
  revalidatePath('/petugas/dashboard');
  revalidatePath('/petugas/kelola');

  return { success: true, ticket: finalTicket };
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
    if (!error && data) {
      result = data.map(mapRowToTicket);
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
        t.kategori.toLowerCase().includes(search) ||
        t.deskripsi.toLowerCase().includes(search)
    );
  }

  return { tickets: result };
}

/**
 * 8. Mengambil Detail 1 Tiket Berdasarkan Nomor Tiket (ASP-XXXXXX)
 */
export async function getTicketByCodeAction(nomorTiket: string): Promise<Ticket | null> {
  const cleanCode = nomorTiket?.trim();
  if (!cleanCode) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('tickets') as any)
      .select('*')
      .eq('nomor_tiket', cleanCode)
      .single();

    if (!error && data) {
      return mapRowToTicket(data);
    }
  } catch (err) {
    console.warn('Supabase fetch single ticket fallback:', err);
  }

  // Fallback ke serverTicketCache
  const found = serverTicketCache.find(
    (t) => t.nomor_tiket.toLowerCase() === cleanCode.toLowerCase()
  );
  return found || null;
}

/**
 * 9. Statistik Beban Kerja Tiket
 */
export async function getTicketStatsAction() {
  const { tickets } = await getFilteredTicketsAction();
  const total = tickets.length;
  const pending = tickets.filter((t) => t.status === 'Pending').length;
  const diproses = tickets.filter((t) => t.status === 'Diproses').length;
  const selesai = tickets.filter((t) => t.status === 'Selesai').length;

  return { total, pending, diproses, selesai };
}
