# Design System & UI Guidelines
## Sistem Pengaduan dan Aspirasi (Help Desk Ticket)

Dokumen ini mendefinisikan standar visual, tata letak antarmuka, dan perilaku komponen interaktif yang wajib dipatuhi saat mengimplementasikan kode frontend aplikasi.

---

## 1. Palet Warna Tailwind CSS

Aplikasi menggunakan palet warna Slate dan Tailwind CSS modern yang elegan untuk memastikan kontras yang tinggi (WCAG AA compliant) dan kenyamanan visual.

| Elemen Antarmuka | Utility Class Tailwind | Nilai Hex / Keterangan |
| :--- | :--- | :--- |
| **Canvas / Page Background** | `bg-slate-50` | `#f8fafc` (Latar belakang utama aplikasi) |
| **Card / Surface Container** | `bg-white border-slate-200` | `#ffffff` dengan border `#e2e8f0` dan `shadow-sm` |
| **Teks Primer (Headings)** | `text-slate-900` | `#0f172a` (Tingkat keterbacaan tertinggi) |
| **Teks Sekunder (Body/Muted)**| `text-slate-600` / `text-slate-500` | `#475569` / `#64748b` (Label form dan metadata) |
| **Brand / Warna Primer** | `bg-indigo-600 hover:bg-indigo-700` | `#4f46e5` $\rightarrow$ `#4338ca` (Tombol aksi utama, fokus input) |
| **Status Sukses / Selesai** | `emerald-600` / `bg-emerald-100` | Teks `#059669`, background badge `#d1fae5` (Status: Selesai) |
| **Status Proses / Diproses** | `blue-600` / `bg-blue-100` | Teks `#2563eb`, background badge `#dbeafe` (Status: Diproses) |
| **Status Menunggu / Pending** | `amber-600` / `bg-amber-100` | Teks `#d97706`, background badge `#fef3c7` (Status: Pending) |
| **Warna Bahaya / Error** | `rose-600` / `bg-rose-50 border-rose-200` | Teks `#e11d48`, background banner `#fff1f2` (Validasi TC-01 & Hapus) |

---

## 2. Tipografi & Lokalisasi Data

### 2.1. Tipografi
* **Font Family:** `font-sans`, diutamakan mengimpor font Google: `Plus Jakarta Sans` atau `Inter`.
* **Hierarki Teks:**
  * Page Title: `text-2xl font-bold tracking-tight text-slate-900`
  * Card Heading: `text-lg font-semibold text-slate-800`
  * Metric Counter: `text-3xl font-extrabold text-slate-900`
  * Form Label: `text-sm font-medium text-slate-700`
  * Table Header: `text-xs font-semibold uppercase tracking-wider text-slate-500`
  * Table Content: `text-sm text-slate-800`

### 2.2. Format Tanggal & Bahasa Indonesia
* Semua waktu dan penanggalan wajib menggunakan locale Indonesia (`id-ID`).
* Format tanggal standar: `DD MMMM YYYY, HH:mm WIB` (contoh: `15 November 2026, 14:30 WIB`).
* Helper JavaScript:
  ```javascript
  const formatTanggalIndo = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };
  ```

---

## 3. Aturan Komponen Interaktif & State Management

### 3.1. Loading State pada Tombol
Ketika permintaan AJAX/Supabase API sedang berlangsung, tombol tidak boleh diklik ganda (*prevent double submission*):
* Tombol menerima atribut `disabled = true`.
* Tampilan tombol ditambahkan kelas `opacity-70 cursor-not-allowed`.
* Teks tombol diganti menjadi ikon animasi spinner + tulisan `"Menyimpan..."` atau `"Memproses..."`.

### 3.2. Alert Banner Validasi Error (TC-01)
* Komponen diletakkan tepat di atas form input.
* Kondisi normal: memiliki kelas `hidden`.
* Kondisi gagal validasi: kelas `hidden` dilepas, menampilkan styling:
  `bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2`.
* Teks pesan wajib persis: **"Deskripsi wajib diisi"**.

### 3.3. Empty State pada Tabel
Jika tidak ada data tiket atau hasil filter pencarian kosong:
* Jangan tampilkan tabel kosong tanpa keterangan.
* Tampilkan kontainer empty state di dalam tabel (`colspan="6"`):
  * Ikon folder/tiket kosong abu-abu (`w-12 h-12 text-slate-300 mx-auto mb-2`).
  * Teks utama: `Belum ada laporan pengaduan`.
  * Teks panduan: `Laporan yang diajukan akan muncul di sini secara otomatis.`

### 3.4. Konfirmasi Penghapusan (Delete Confirmation)
* Tombol "Hapus" tidak boleh langsung mengeksekusi penghapusan database.
* Wajib memicu dialog konfirmasi:
  ```javascript
  const yakin = confirm(`Apakah Anda yakin ingin menghapus tiket ${nomorTiket}?`);
  if (!yakin) return;
  ```
