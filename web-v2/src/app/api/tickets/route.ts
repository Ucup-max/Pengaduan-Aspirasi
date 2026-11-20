import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_TICKETS } from '@/lib/constants';
import { Ticket } from '@/types';

// In-memory runtime fallback store if Supabase network is unavailable
let runtimeTickets: Ticket[] = [...INITIAL_TICKETS];

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
      // Map Supabase rows to Ticket objects
      const mappedTickets: Ticket[] = data.map((row: any) => ({
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

      // Update runtime cache
      runtimeTickets = mappedTickets;

      if (ticketNumber) {
        const found = mappedTickets.find(
          (t) => t.nomor_tiket.toLowerCase() === ticketNumber.toLowerCase()
        );
        return NextResponse.json({ tickets: found ? [found] : [] });
      }

      return NextResponse.json({ tickets: mappedTickets });
    }
  } catch (err) {
    console.warn('Supabase query error, using runtime cache:', err);
  }

  // Fallback to runtime tickets
  if (ticketNumber) {
    const found = runtimeTickets.find(
      (t) => t.nomor_tiket.toLowerCase() === ticketNumber.toLowerCase()
    );
    return NextResponse.json({ tickets: found ? [found] : [] });
  }

  return NextResponse.json({ tickets: runtimeTickets });
}

export async function POST(request: Request) {
  try {
    const newTicket: Ticket = await request.json();

    // 1. Try saving to Supabase Cloud
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
      }
    } catch (e) {
      console.warn('Supabase insert warning, saved to runtime cache:', e);
    }

    // 2. Prepend to runtime cache
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

    const ticketIndex = runtimeTickets.findIndex(
      (t) => t.id === Number(ticketId) || t.nomor_tiket === ticketId
    );

    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
    }

    const currentTicket = runtimeTickets[ticketIndex];

    // Update fields
    if (status) {
      currentTicket.status = status;
    }
    if (catatan) {
      currentTicket.catatan_penanganan = catatan;
      const historyItem = {
        status: status || currentTicket.status,
        waktu: new Date().toISOString(),
        catatan,
        petugas: petugas || 'Petugas Helpdesk',
      };
      currentTicket.riwayat = [...(currentTicket.riwayat || []), historyItem];
    }
    if (typeof konfirmasi_selesai === 'boolean') {
      currentTicket.konfirmasi_selesai = konfirmasi_selesai;
    }
    if (typeof rating === 'number') {
      currentTicket.rating = rating;
    }
    if (typeof feedback === 'string') {
      currentTicket.feedback = feedback;
    }

    runtimeTickets[ticketIndex] = { ...currentTicket };

    // Update Supabase Cloud if available
    try {
      const supabase = await createClient();
      await (supabase.from('tickets') as any)
        .update({
          status: currentTicket.status,
          catatan_penanganan: currentTicket.catatan_penanganan,
          riwayat: currentTicket.riwayat as any,
          konfirmasi_selesai: currentTicket.konfirmasi_selesai,
          rating: currentTicket.rating,
          feedback: currentTicket.feedback,
        })
        .eq('nomor_tiket', currentTicket.nomor_tiket);
    } catch (e) {
      console.warn('Supabase update warning:', e);
    }

    return NextResponse.json({ success: true, ticket: currentTicket });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui tiket' }, { status: 500 });
  }
}
