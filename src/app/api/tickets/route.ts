import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_TICKETS } from '@/lib/constants';
import { Ticket } from '@/types';
import { mapRowToTicket } from '@/lib/ticket-mapper';

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
      const mappedTickets: Ticket[] = data.map(mapRowToTicket);

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

    const ticketIndex = runtimeTickets.findIndex(
      (t) => t.id === Number(ticketId) || t.nomor_tiket === ticketId
    );

    let currentTicket = ticketIndex !== -1 ? runtimeTickets[ticketIndex] : null;

    if (currentTicket) {
      if (status) currentTicket.status = status;
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
      if (typeof konfirmasi_selesai === 'boolean') currentTicket.konfirmasi_selesai = konfirmasi_selesai;
      if (typeof rating === 'number') currentTicket.rating = rating;
      if (typeof feedback === 'string') currentTicket.feedback = feedback;

      runtimeTickets[ticketIndex] = { ...currentTicket };
    }

    // Update Supabase Cloud
    let updateSuccess = false;
    try {
      const supabase = await createClient();
      const { error } = await (supabase.from('tickets') as any)
        .update({
          status: status || currentTicket?.status,
          catatan_penanganan: catatan || currentTicket?.catatan_penanganan,
          riwayat: currentTicket?.riwayat as any,
          konfirmasi_selesai: konfirmasi_selesai,
          rating: rating,
          feedback: feedback,
        })
        .eq('nomor_tiket', currentTicket?.nomor_tiket || ticketId);

      if (!error) updateSuccess = true;
    } catch {
      // fallback
    }

    if (!updateSuccess) {
      try {
        const supabase = await createClient();
        const { data: existingRow } = await (supabase.from('tickets') as any)
          .select('deskripsi')
          .eq('nomor_tiket', currentTicket?.nomor_tiket || ticketId)
          .single();

        let newDeskripsi = existingRow?.deskripsi || currentTicket?.deskripsi || '';
        if (catatan) {
          newDeskripsi += `\n\n[Catatan Petugas: ${catatan}]`;
        }

        await (supabase.from('tickets') as any)
          .update({
            status: status || currentTicket?.status,
            deskripsi: newDeskripsi.trim(),
          })
          .eq('nomor_tiket', currentTicket?.nomor_tiket || ticketId);
      } catch (e) {
        console.warn('Supabase fallback status update warning:', e);
      }
    }

    return NextResponse.json({ success: true, ticket: currentTicket });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui tiket' }, { status: 500 });
  }
}
