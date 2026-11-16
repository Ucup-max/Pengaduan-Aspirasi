-- ===================================================================
-- SCRIPT SUPABASE POSTGRESQL: SISTEM PENGADUAN DAN ASPIRASI
-- Sesuai Modul 2 SKPL & Standar Keamanan RLS Supabase
-- ===================================================================

-- 1. Buat Tabel Sesuai Nama & Field Modul 2 SKPL
CREATE TABLE IF NOT EXISTS public.tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomor_tiket VARCHAR(30) NOT NULL UNIQUE,
    nama_pelapor VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    deskripsi TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- 2. Pasang Constraint CHECK untuk Mengunci Integritas Data & Aturan TC-01
    CONSTRAINT chk_deskripsi_tidak_kosong CHECK (trim(deskripsi) <> ''),
    CONSTRAINT chk_nama_pelapor_tidak_kosong CHECK (trim(nama_pelapor) <> ''),
    CONSTRAINT chk_nomor_tiket_tidak_kosong CHECK (trim(nomor_tiket) <> ''),
    CONSTRAINT chk_status_valid CHECK (status IN ('Pending', 'Diproses', 'Selesai'))
);

-- Indeks Tambahan untuk Optimalisasi Pencarian & Filter
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_kategori ON public.tickets (kategori);
CREATE INDEX IF NOT EXISTS idx_tickets_nomor_tiket ON public.tickets (nomor_tiket);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 4. Pasang Policy Akses Lengkap (CRUD) untuk Role 'anon' (Workshop Demo)
-- Policy SELECT: Pengguna anonim/klien dapat melihat seluruh riwayat aduan
DROP POLICY IF EXISTS "Allow anon select tickets" ON public.tickets;
CREATE POLICY "Allow anon select tickets"
ON public.tickets
FOR SELECT
TO anon
USING (true);

-- Policy INSERT: Pengguna dapat mengajukan tiket baru dengan validasi constraint
DROP POLICY IF EXISTS "Allow anon insert tickets" ON public.tickets;
CREATE POLICY "Allow anon insert tickets"
ON public.tickets
FOR INSERT
TO anon
WITH CHECK (
    trim(deskripsi) <> '' AND
    trim(nama_pelapor) <> '' AND
    trim(nomor_tiket) <> '' AND
    status IN ('Pending', 'Diproses', 'Selesai')
);

-- Policy UPDATE: Petugas/Pengguna dapat memperbarui status atau detail tiket
DROP POLICY IF EXISTS "Allow anon update tickets" ON public.tickets;
CREATE POLICY "Allow anon update tickets"
ON public.tickets
FOR UPDATE
TO anon
USING (true)
WITH CHECK (
    trim(deskripsi) <> '' AND
    trim(nama_pelapor) <> '' AND
    status IN ('Pending', 'Diproses', 'Selesai')
);

-- Policy DELETE: Pengguna dapat menghapus baris tiket
DROP POLICY IF EXISTS "Allow anon delete tickets" ON public.tickets;
CREATE POLICY "Allow anon delete tickets"
ON public.tickets
FOR DELETE
TO anon
USING (true);

-- 5. Masukkan 3 Data Contoh (Dummy Data) Realistis
INSERT INTO public.tickets (nomor_tiket, nama_pelapor, kategori, deskripsi, status)
VALUES
    (
        'TKT-20261115-001',
        'Ahmad Fauzi',
        'Sarana & Prasarana',
        'Proyektor di ruang Lab Komputer 3 tidak memancarkan layar (lampu indikator berkedip merah).',
        'Pending'
    ),
    (
        'TKT-20261115-002',
        'Siti Nurhaliza',
        'Teknologi & Informasi',
        'Koneksi Wi-Fi kampus di Gedung Perpustakaan Lantai 2 mengalami kendala autentikasi SSO.',
        'Diproses'
    ),
    (
        'TKT-20261115-003',
        'Budi Santoso',
        'Layanan Administrasi',
        'Pengajuan legalisir transkrip nilai akademik online belum menerima email konfirmasi pengambilan.',
        'Selesai'
    )
ON CONFLICT (nomor_tiket) DO NOTHING;
