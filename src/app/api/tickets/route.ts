import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_TICKETS } from '@/lib/constants';
import { Ticket } from '@/types';
import { mapRowToTicket } from '@/lib/ticket-mapper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory runtime fallback store if Supabase network is unavailable
let runtimeTickets: Ticket[] = [...INITIAL_TICKETS];

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketNumber = searchParams.get('ticket');

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mappedTickets: Ticket[] = data.map(mapRowToTicket);

      // Update runtime cache
      runtimeTickets = mappedTickets;

      if (ticketNumber) {
        const found = mappedTickets.find(
          (t) => t.nomor_tiket.toLowerCase() === ticketNumber.toLowerCase()
        );
        return NextResponse.json({ tickets: found ? [found] : [] }, { headers: NO_CACHE_HEADERS });
      }

      return NextResponse.json({ tickets: mappedTickets }, { headers: NO_CACHE_HEADERS });
    }
  } catch (err) {
    console.warn('Supabase query error, using runtime cache:', err);
  }

  // Fallback to runtime tickets
  if (ticketNumber) {
    const found = runtimeTickets.find(
      (t) => t.nomor_tiket.toLowerCase() === ticketNumber.toLowerCase()
    );
    return NextResponse.json({ tickets: found ? [found] : [] }, { headers: NO_CACHE_HEADERS });
  }

  return NextResponse.json({ tickets: runtimeTickets }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: Request) {
  try {
    const newTicket: Ticket = await request.json();

    let savedToSupabase = false;

    // Tahap 1: Simpan full payload jika kolom tersedia
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          nomor_tiket: newTicket.nomor_tiket,
          nama_pelapor: newTicket.nama_pelapor,
          kategori: newTicket.kategori,
          deskripsi: newTicket.deskripsi,
          status: newTicket.status || 'Pending',
          lokasi: newTicket.lokasi || null,
          is_anonim: !!newTicket.is_anonim,
          lampiran_foto: newTicket.lampiran_foto || null,
          catatan_penanganan: newTicket.catatan_penanganan || null,
          riwayat: newTicket.riwayat || [],
          konfirmasi_selesai: false,
        } as any)
        .select()
        .single();

      if (!error && data) {
        newTicket.id = (data as any).id;
        savedToSupabase = true;
      }
    } catch {
      // Fallback ke skema core
    }

    // Tahap 2: Resilient insert jika tabel Supabase hanya memiliki skema core
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
            status: newTicket.status || 'Pending',
          } as any)
          .select()
          .single();

        if (!error && data) {
          newTicket.id = (data as any).id;
          savedToSupabase = true;
        } else if (error) {
          console.error('Supabase core insert error (API route):', error);
        }
      } catch (err) {
        console.error('Supabase core insert fatal (API route):', err);
      }
    }

    // Prepend to runtime cache
    if (!newTicket.id) {
      newTicket.id = Date.now();
    }
    runtimeTickets = [newTicket, ...runtimeTickets.filter((t) => t.nomor_tiket !== newTicket.nomor_tiket)];

    return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses tiket' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status, catatan, petugas, konfirmasi_selesai, rating, feedback } = body;
    const rawId = String(ticketId).trim();

    let targetTicket: Ticket | null = null;
    const supabase = await createClient();

    try {
      let query = supabase.from('tickets').select('*');
      if (!isNaN(Number(rawId))) {
        query = query.or(`nomor_tiket.eq.${rawId},id.eq.${Number(rawId)}`);
      } else {
        query = query.eq('nomor_tiket', rawId);
      }
      const { data: dbRow } = await query.single();
      if (dbRow) {
        targetTicket = mapRowToTicket(dbRow);
      }
    } catch {}

    if (!targetTicket) {
      targetTicket = runtimeTickets.find(
        (t) => t.id === Number(ticketId) || t.nomor_tiket === rawId
      ) || null;
    }

    if (!targetTicket) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
    }

    const updatedHistory = [...(targetTicket.riwayat || [])];
    if (catatan) {
      updatedHistory.push({
        status: status || targetTicket.status,
        waktu: new Date().toISOString(),
        catatan,
        petugas: petugas || 'Petugas Helpdesk',
      });
    }

    // Update Supabase Cloud (Tahap 1: skema penuh)
    let updateSuccess = false;
    try {
      const { error } = await (supabase.from('tickets') as any)
        .update({
          status: status || targetTicket.status,
          catatan_penanganan: catatan || targetTicket.catatan_penanganan,
          riwayat: updatedHistory as any,
          konfirmasi_selesai: typeof konfirmasi_selesai === 'boolean' ? konfirmasi_selesai : targetTicket.konfirmasi_selesai,
          rating: typeof rating === 'number' ? rating : targetTicket.rating,
          feedback: typeof feedback === 'string' ? feedback : targetTicket.feedback,
        })
        .eq('nomor_tiket', targetTicket.nomor_tiket);

      if (!error) updateSuccess = true;
    } catch {
      // fallback
    }

    // Tahap 2: fallback skema dasar
    if (!updateSuccess) {
      try {
        let newDeskripsi = targetTicket.deskripsi || '';
        if (catatan) {
          newDeskripsi += `\n\n[Catatan Petugas: ${catatan}]`;
        }

        await (supabase.from('tickets') as any)
          .update({
            status: status || targetTicket.status,
            deskripsi: newDeskripsi.trim(),
          })
          .eq('nomor_tiket', targetTicket.nomor_tiket);
      } catch (e) {
        console.warn('Supabase fallback status update warning:', e);
      }
    }

    const finalUpdatedTicket: Ticket = {
      ...targetTicket,
      status: status || targetTicket.status,
      catatan_penanganan: catatan || targetTicket.catatan_penanganan,
      riwayat: updatedHistory,
      konfirmasi_selesai: typeof konfirmasi_selesai === 'boolean' ? konfirmasi_selesai : targetTicket.konfirmasi_selesai,
      rating: typeof rating === 'number' ? rating : targetTicket.rating,
      feedback: typeof feedback === 'string' ? feedback : targetTicket.feedback,
    };

    runtimeTickets = [
      finalUpdatedTicket,
      ...runtimeTickets.filter((t) => t.nomor_tiket !== finalUpdatedTicket.nomor_tiket),
    ];

    return NextResponse.json({ success: true, ticket: finalUpdatedTicket }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui tiket' }, { status: 500 });
  }
}
