# Product Requirements Document (PRD)
## Sistem Pengaduan dan Aspirasi (Help Desk Ticket)

---

## 1. Identitas & Tujuan Aplikasi
* **Nama Aplikasi:** Sistem Pengaduan dan Aspirasi (Help Desk Ticket Web Application)
* **Kategori Sistem:** Public Service & Technical Support Ticketing System
* **Ringkasan Sistem:** Aplikasi web responsif untuk menampung, memproses, dan memantau status pengaduan serta aspirasi pengguna secara transparan, terstruktur, dan akuntabel melalui penomoran tiket otomatis.
* **Capaian Utama:**
  1. Tersedianya antarmuka pelaporan keluhan/aspirasi dengan validasi ketat (menolak laporan tanpa deskripsi).
  2. Penerbitan kode unik tiket pengaduan (`nomor_tiket`) secara otomatis.
  3. Pelacakan status pengerjaan tiket bertahap (*Pending*, *Diproses*, *Selesai*) secara *real-time*.
  4. Siklus manajemen tiket komprehensif (Create, Read, Update, Delete) yang aman dari celah Cross-Site Scripting (XSS).

---

## 2. Spesifikasi Fungsional Lengkap (CRUD + Kalkulasi & Filter)

### 2.1. Pemetaan Kebutuhan Inti SKPL
* **REQ-01 (Pengajuan Pengaduan):** Pengguna dapat menginput nama pelapor, kategori masalah, dan detail deskripsi aduan untuk menerbitkan tiket aduan baru.
* **REQ-02 (Manajemen & Pembaruan Status Tiket):** Petugas/pengelola dapat memperbarui tahapan penanganan tiket dari `Pending` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai`.

### 2.2. Kelengkapan Siklus CRUD & Fungsionalitas Lanjutan
* **Fitur Create (Tambah Aduan Baru):**
  * Pengguna mengisi form: Nama Pelapor, Kategori, dan Deskripsi.
  * Sistem meng-generate `nomor_tiket` unik otomatis dengan format `TKT-YYYYMMDD-XXXX` (atau nomor urut timestamp).
  * Default status saat pembuatan adalah `Pending`.
  * Memiliki validasi sisi klien (JavaScript) dan validasi database: field deskripsi tidak boleh kosong/hanya spasi.
* **Fitur Read (Tabel Data & Metrik Ringkasan):**
  * **Kartu Ringkasan (KPI/Summary Cards):**
    1. *Total Tiket:* Akumulasi seluruh tiket yang terdaftar.
    2. *Tiket Aktif:* Jumlah tiket dengan status `Pending` dan `Diproses`.
    3. *Tiket Selesai:* Jumlah tiket dengan status `Selesai`.
  * **Tabel Riwayat Aduan:** Menampilkan kolom Nomor Tiket, Nama Pelapor, Kategori, Cuplikan Deskripsi, Status (dengan badge warna), dan Tombol Aksi.
* **Fitur Update (Ubah Status & Detail Tiket):**
  * Petugas dapat memilih tiket untuk mode edit.
  * Form beralih ke mode update (tombol "Simpan Perubahan" dan "Batal").
  * Petugas dapat mengubah status penanganan (`Pending`, `Diproses`, `Selesai`) serta memperbarui keterangan pendukung.
* **Fitur Delete (Hapus Tiket):**
  * Petugas dapat menghapus tiket yang tidak valid atau duplikat.
  * Dilengkapi dialog konfirmasi modal/pop-up: *"Apakah Anda yakin ingin menghapus tiket [nomor_tiket]?"* untuk mencegah *accidental deletion*.
* **Fitur Search & Filter Interaktif:**
  * **Search Bar:** Pencarian instan *real-time* berdasarkan kata kunci pada `nomor_tiket`, `nama_pelapor`, atau `deskripsi`.
  * **Filter Dropdown:** Memfilter tabel data berdasarkan `status` (`Semua`, `Pending`, `Diproses`, `Selesai`) dan filter berdasarkan `kategori`.

---

## 3. Spesifikasi Skema Data (Supabase PostgreSQL)

Nama tabel dan kolom mengacu 100% pada **Modul 2 SKPL**:
* **Nama Tabel:** `tickets`

| Nama Kolom | Tipe Data PostgreSQL | Constraint / Aturan Validasi | Keterangan Fungsional |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT GENERATED ALWAYS AS IDENTITY` | `PRIMARY KEY` | Kunci unik pengenal baris data. |
| `nomor_tiket` | `VARCHAR(30)` | `NOT NULL, UNIQUE, CHECK (length(trim(nomor_tiket)) > 0)` | Nomor unik identifikasi tiket aduan (contoh: `TKT-20261115-001`). |
| `nama_pelapor`| `VARCHAR(100)` | `NOT NULL, CHECK (length(trim(nama_pelapor)) > 0)` | Nama lengkap pengguna/pelapor. |
| `kategori` | `VARCHAR(50)` | `NOT NULL, CHECK (length(trim(kategori)) > 0)` | Kategori pengaduan (contoh: Layanan, Teknis, Fasilitas). |
| `deskripsi` | `TEXT` | `NOT NULL, CHECK (length(trim(deskripsi)) > 0)` | Uraian masalah/aspirasi (Wajib diisi; dasar verifikasi TC-01). |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'Pending', CHECK (status IN ('Pending', 'Diproses', 'Selesai'))` | Status penanganan aduan (dasar verifikasi TC-02). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT timezone('utc'::text, now())` | Catatan waktu pelaporan otomatis. |

---

## 4. Kontrak Pengujian Black Box & Keamanan (Acuan Mutlak QA)

| ID Uji | Tipe Pengujian | Skenario Pengujian | Input Data / Kondisi | Hasil yang Diharapkan (Expected Result) | Standar Toleransi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Fungsional (Validasi) | Submit Laporan Kosong | Form diisi, namun `deskripsi` dikosongkan: `[Kosong]` / spasi saja. | Sistem menolak simpan, form tidak ter-submit ke Supabase, dan menampilkan pesan alert merah: **"Deskripsi wajib diisi"**. | Mutlak (Zero Tolerance) |
| **TC-02** | Fungsional (Update) | Update Status Tiket | Ubah status tiket dari `Pending` ke `Diproses`. | Status tiket terbarui pada database dan langsung tercermin pada dashboard/tabel utama secara akurat. | Mutlak |
| **SEC-01**| Keamanan (Anti-XSS) | Injeksi Skrip Berbahaya | Field `nama_pelapor` atau `deskripsi` diisi payload: `<img src=x onerror=alert(1)>` | Karakter HTML dieksekusi sebagai teks murni (plain text melalui `.textContent` atau sanitasi `escapeHtml`). Tidak ada dialog alert pop-up yang muncul. | Zero Vulnerability |
| **SEC-02**| Keamanan (Kredensial)| Audit Kredensial Frontend | Inspeksi seluruh berkas frontend (`index.html`, script JS). | Hanya `SUPABASE_URL` dan `SUPABASE_ANON_KEY` yang terlihat. Variabel rahasia seperti `service_role` atau API key privat TIDAK BOLEH ada di kode client-side. | Zero Leakage |
