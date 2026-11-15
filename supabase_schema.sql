-- ===================================================================
-- SCRIPT DATABASE SETUP: SISTEM PENGADUAN DAN ASPIRASI (HELP DESK)
-- Platform : Supabase / PostgreSQL
-- Acuan    : Modul 2 & Modul 3 SKPL (Testing TC-01, TC-02 & Security)
-- ===================================================================

-- 1. PEMBUATAN TABEL TICKETS
-- Sesuai Modul 2 SKPL: tickets (id, nomor_tiket, nama_pelapor, kategori, deskripsi, status)
CREATE TABLE IF NOT EXISTS public.tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomor_tiket VARCHAR(30) NOT NULL,
    nama_pelapor VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    deskripsi TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Constraint TC-01: Deskripsi wajib diisi (tidak boleh string kosong atau spasi)
    CONSTRAINT ck_tickets_deskripsi_not_empty CHECK (length(trim(deskripsi)) > 0),
    
    -- Constraint Integritas Kolom Input Lainnya
    CONSTRAINT ck_tickets_nomor_tiket_not_empty CHECK (length(trim(nomor_tiket)) > 0),
    CONSTRAINT ck_tickets_nama_pelapor_not_empty CHECK (length(trim(nama_pelapor)) > 0),
    CONSTRAINT ck_tickets_kategori_not_empty CHECK (length(trim(kategori)) > 0),

    -- Constraint ENUM Status: Pending, Diproses, Selesai
    CONSTRAINT ck_tickets_status_valid CHECK (status IN ('Pending', 'Diproses', 'Selesai')),

    -- Constraint Unik Nomor Tiket
    CONSTRAINT uq_tickets_nomor_tiket UNIQUE (nomor_tiket)
);

-- Indexing untuk akselerasi pencarian dan pemfilteran
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_nomor_tiket ON public.tickets (nomor_tiket);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets (created_at DESC);

-- ===================================================================
-- 2. KONFIGURASI ROW LEVEL SECURITY (RLS)
-- Mengamankan tabel dari akses tidak terotorisasi
-- ===================================================================

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika sudah pernah dibuat sebelumnya
DROP POLICY IF EXISTS "Anon Select Policy on Tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anon Insert Policy on Tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anon Update Policy on Tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anon Delete Policy on Tickets" ON public.tickets;

-- 2.1. Policy READ (SELECT): Mengizinkan publik/anon membaca seluruh data tiket aduan
CREATE POLICY "Anon Select Policy on Tickets" 
ON public.tickets 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 2.2. Policy CREATE (INSERT): Mengizinkan publik mengajukan tiket aduan baru
-- Memastikan lolos validasi TC-01 (deskripsi tidak boleh kosong) di tingkat DB Policy
CREATE POLICY "Anon Insert Policy on Tickets" 
ON public.tickets 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
    length(trim(deskripsi)) > 0 
    AND length(trim(nama_pelapor)) > 0 
    AND length(trim(nomor_tiket)) > 0 
    AND status IN ('Pending', 'Diproses', 'Selesai')
);

-- 2.3. Policy UPDATE: Mengizinkan pembaruan status pengerjaan tiket (TC-02)
CREATE POLICY "Anon Update Policy on Tickets" 
ON public.tickets 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (
    length(trim(deskripsi)) > 0 
    AND status IN ('Pending', 'Diproses', 'Selesai')
);

-- 2.4. Policy DELETE: Mengizinkan penghapusan baris data tiket pengaduan
CREATE POLICY "Anon Delete Policy on Tickets" 
ON public.tickets 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- ===================================================================
-- 3. DATA CONTOH REALISTIS (INITIAL DUMMY DATA)
-- Memastikan dashboard langsung memiliki tampilan saat pertama dijalankan
-- ===================================================================

INSERT INTO public.tickets (nomor_tiket, nama_pelapor, kategori, deskripsi, status, created_at)
VALUES 
    (
        'TKT-20261115-001', 
        'Ahmad Fauzi', 
        'Kendala Teknis', 
        'Tidak dapat mengakses portal sistem informasi akademik saat mengunggah berkas registrasi semester.', 
        'Pending',
        timezone('utc'::text, now() - INTERVAL '3 hours')
    ),
    (
        'TKT-20261115-002', 
        'Siti Nurhaliza', 
        'Sarana & Prasarana', 
        'Koneksi Wi-Fi di lantai 3 Gedung Workshop terputus-putus sejak pagi dan membutuhkan reset access point.', 
        'Diproses',
        timezone('utc'::text, now() - INTERVAL '1 day')
    ),
    (
        'TKT-20261114-001', 
        'Budi Santoso', 
        'Layanan Publik', 
        'Permohonan legalisir dokumen sertifikat pelatihan telah diverifikasi dan siap diambil di loket layanan.', 
        'Selesai',
        timezone('utc'::text, now() - INTERVAL '2 days')
    )
ON CONFLICT (nomor_tiket) DO NOTHING;

-- Verifikasi data yang baru dimasukkan
SELECT id, nomor_tiket, nama_pelapor, kategori, status, created_at FROM public.tickets ORDER BY id ASC;
