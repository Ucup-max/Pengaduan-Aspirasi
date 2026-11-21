# Product Requirements Document (PRD)
## Sistem Pengaduan dan Aspirasi (Help Desk Ticket)

---

### 1. Identitas & Tujuan Aplikasi
* **Nama Aplikasi:** Sistem Pengaduan dan Aspirasi (Help Desk Ticket System)
* **Ringkasan Sistem:** Aplikasi berbasis web modern untuk menampung, memproses, mengelola, dan memantau status pengaduan serta aspirasi pengguna (mahasiswa/publik) secara terpusat, transparan, dan terstruktur dengan sistem penomoran tiket unik.
* **Capaian Utama (Main Achievement):** 
  1. Terbangunnya portal help desk digital yang transparan dan akuntabel.
  2. Implementasi siklus hidup pengaduan bertahap dengan status: `Pending` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai`.
  3. Penegakan integritas data melalui validasi form ketat di sisi *client* dan *database* yang dibuktikan dengan kelulusan uji Black Box Testing & Security Testing.
* **Batasan Sistem (Out of Scope):**
  * Tidak mencakup otomatisasi SMS / WhatsApp Gateway.
  * Tidak menyediakan fitur Live Chat *real-time*.
  * Tidak mencakup eskalasi tiket multi-level lintas instansi secara otomatis.

---

### 2. Spesifikasi Fungsional Lengkap (CRUD, Kalkulasi, Search & Filter)

#### A. Pemetaan Kebutuhan Inti SKPL
* **`REQ-01` (Pengajuan Pengaduan):** Pengguna dapat menginput data laporan kendala yang mencakup nama pelapor, kategori, dan deskripsi aduan. Sistem secara otomatis menerbitkan nomor tiket unik (format: `TKT-YYYYMMDD-XXXX`).
* **`REQ-02` (Manajemen & Pembaruan Tiket):** Petugas/Admin dapat memperbarui status penanganan tiket secara bertahap mulai dari `Pending`, `Diproses`, hingga `Selesai`.

#### B. Kelengkapan Siklus Fungsional (CRUD & Interaktivitas)
1. **Create (Pengajuan Tiket Baru):**
   - Form input interaktif untuk: `nomor_tiket` (dibuat otomatis oleh sistem atau dapat diisi manual jika dibutuhkan), `nama_pelapor`, `kategori` (dropdown opsi: *Fasilitas & Sarana, Akademik, Layanan Administrasi, Finansial, Teknologi & Informasi, Lainnya*), `deskripsi` (textarea lengkap), dan `status` default `Pending`.
   - Validasi ketat sisi klien sebelum pengiriman data.
2. **Read (Dashboard & Visualisasi Data):**
   - **Kartu Ringkasan (KPI Cards):**
     * *Total Seluruh Tiket:* Akumulasi seluruh aduan yang masuk.
     * *Tiket Pending / Menunggu:* Aduan yang belum ditangani (status `Pending`).
     * *Tiket Diproses / Selesai:* Rincian aduan aktif yang sedang ditindaklanjuti (`Diproses`) dan yang telah tuntas (`Selesai`).
   - **Tabel Riwayat Pengaduan:** Menampilkan seluruh data tiket secara tabular dengan kolom: Nomor Tiket, Nama Pelapor, Kategori, Ringkasan Deskripsi, Badge Status, Tanggal/Waktu, dan Kolom Aksi.
3. **Update (Perubahan Status & Data Tiket):**
   - Mode edit cepat untuk memperbarui status penanganan tiket (`Pending` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai`) atau memperbarui rincian aduan.
   - Tombol *Batal Edit* untuk mengembalikan form ke status tambah baru.
4. **Delete (Penghapusan Tiket):**
   - Fitur penghapusan baris tiket yang dilengkapi dialog konfirmasi (*confirmation modal/alert*) untuk mencegah kehilangan data akibat klik tidak sengaja.
5. **Search & Filter (Pencarian & Penyaringan Interaktif):**
   - *Instant Search Bar:* Pencarian *real-time* berbasis nomor tiket, nama pelapor, atau kata kunci deskripsi.
   - *Filter Kategori:* Dropdown untuk menyaring tiket berdasarkan rumpun masalah.
   - *Filter Status:* Tab atau dropdown untuk memfilter tiket berdasarkan status (`Semua`, `Pending`, `Diproses`, `Selesai`).

---

### 3. Spesifikasi Skema Data (Supabase PostgreSQL)

Nama tabel dan kolom mengacu 100% sama persis dengan Modul 2 SKPL:

#### Tabel: `public.tickets`

| Nama Kolom | Tipe Data PostgreSQL | Aturan Validasi / Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT GENERATED ALWAYS AS IDENTITY` | `PRIMARY KEY` | ID unik penanda baris data (Auto Increment). |
| `nomor_tiket` | `VARCHAR(30)` | `NOT NULL`, `UNIQUE` | Kode tiket unik pengaduan (contoh: `TKT-20261115-001`). |
| `nama_pelapor` | `VARCHAR(100)` | `NOT NULL`, `CHECK (trim(nama_pelapor) <> '')` | Nama lengkap pengguna/mahasiswa yang menyampaikan laporan. |
| `kategori` | `VARCHAR(50)` | `NOT NULL`, `CHECK (trim(kategori) <> '')` | Klasifikasi masalah/aduan. |
| `deskripsi` | `TEXT` | `NOT NULL`, `CHECK (trim(deskripsi) <> '')` | Rincian lengkap kendala yang dilaporkan. |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'Pending'`, `CHECK (status IN ('Pending', 'Diproses', 'Selesai'))` | Status tahapan penanganan tiket aduan. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT timezone('utc'::text, now())` | Catatan waktu pembuatan tiket secara otomatis. |

---

### 4. Kontrak Pengujian Black Box & Keamanan (Acuan Mutlak QA)

Tabel berikut menjadi tolok ukur pengujian penerimaan sistem:

| ID Test | Kategori | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Status Kelulusan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`TC-01`** | Fungsional | Submit Laporan Kosong | Deskripsi: *[Kosong / Hanya Spasi]* | Sistem menolak simpan & menampilkan pesan `"Deskripsi wajib diisi"`. Data tidak dikirim ke database. | **PASS** |
| **`TC-02`** | Fungsional | Update Status Tiket | Ubah status tiket dari `Pending` ke `Diproses` | Status tiket terbarui pada dashboard utama secara akurat tanpa *reload* seluruh halaman (*reactive update*). | **PASS** |
| **`SEC-01`** | Keamanan | Pengujian Anti-XSS (Cross-Site Scripting) | Nama Pelapor / Deskripsi diisi payload: `<img src=x onerror=alert(1)>` | Input dirender sebagai teks biasa murni (*plain text*). Script tidak dieksekusi di browser, tidak muncul popup alert jahat. | **PASS** |
| **`SEC-02`** | Keamanan | Audit Kredensial Frontend | Inspeksi kode sumber file `index.html` dan `app.js` | Hanya ditemukan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`. Tidak ada `SERVICE_ROLE_KEY` atau secret token apa pun. | **PASS** |
