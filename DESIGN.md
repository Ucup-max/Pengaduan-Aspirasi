# Design System & UI Guidelines
## Sistem Pengaduan dan Aspirasi (Help Desk Ticket)

Dokumen ini adalah pedoman visual dan interaksi frontend untuk diimplementasikan menggunakan Tailwind CSS dan Vanilla JavaScript modern.

---

### 1. Palet Warna (Tailwind CSS Palette)

| Komponen / Kegunaan | Kelas Tailwind CSS | Nilai Hex / Visual |
| :--- | :--- | :--- |
| **Canvas Background** | `bg-slate-50` | `#F8FAFC` (Latar belakang aplikasi) |
| **Card & Surface** | `bg-white border-slate-200 shadow-sm` | `#FFFFFF` (Permukaan kartu kontainer) |
| **Border & Divider** | `border-slate-200` / `border-slate-100` | `#E2E8F0` |
| **Primary Accent** | `bg-indigo-600 hover:bg-indigo-700` | `#4F46E5` (Tombol utama, fokus input) |
| **Text Primary** | `text-slate-900` | `#0F172A` (Judul dan label form) |
| **Text Secondary** | `text-slate-500` | `#64748B` (Placeholder dan teks pendukung) |
| **Status Pending (Warning)** | `bg-amber-50 text-amber-700 border-amber-200` | `#D97706` (Badge status Pending) |
| **Status Diproses (Info)** | `bg-sky-50 text-sky-700 border-sky-200` | `#0284C7` (Badge status Diproses) |
| **Status Selesai (Success)** | `bg-emerald-50 text-emerald-700 border-emerald-200`| `#059669` (Badge status Selesai) |
| **Danger / Error (TC-01)** | `bg-rose-50 text-rose-700 border-rose-200` | `#E11D48` (Pesan error & tombol hapus) |

---

### 2. Tipografi & Format Lokalisasi (Indonesian Standards)

* **Font Family:** `font-sans` (`Inter`, `Plus Jakarta Sans`, atau sistem fallback sans-serif).
* **Hierarki Font:**
  - H1 (Header Utama): `text-2xl font-bold tracking-tight text-slate-900`
  - Subtitle: `text-sm text-slate-500`
  - KPI Card Value: `text-3xl font-extrabold text-slate-900`
  - Section Title: `text-lg font-semibold text-slate-800`
  - Table Content: `text-sm text-slate-700`
* **Format Tanggal Indonesia (`id-ID`):**
  Format waktu tiket menggunakan format lokal Indonesia:
  ```javascript
  new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }); // Contoh: 15 Nov 2026, 14.30
  ```

---

### 3. Aturan Komponen Interaktif

#### A. Alert Banner Validasi (`TC-01`)
* Wajib berupa kotak peringatan dinamis di bagian atas form input:
  ```html
  <div id="alertBox" class="hidden mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
    <svg class="w-5 h-5 flex-shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">...</svg>
    <span id="alertMessage">Deskripsi wajib diisi</span>
  </div>
  ```
* Transisi halus saat muncul (*fade-in* atau hapus kelas `hidden`).

#### B. Tombol Simpan & Loading State
* Saat proses kirim data berlangsung ke Supabase, tombol wajib memicu *loading state*:
  - Berikan atribut `disabled`.
  - Ubah teks tombol menjadi `"Menyimpan..."`.
  - Tampilkan icon *spinner* SVG berputar (`animate-spin`).

#### C. Empty State (Tabel Kosong)
* Jika tabel tiket tidak memiliki data (atau hasil filter kosong):
  - Tampilkan baris kosong dengan pesan ramah pengguna:
  ```html
  <div class="py-12 text-center">
    <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">...</svg>
    <h3 class="mt-2 text-sm font-medium text-slate-900">Belum ada pengaduan</h3>
    <p class="mt-1 text-sm text-slate-500">Tiket aspirasi yang dikirimkan akan muncul di sini.</p>
  </div>
  ```

#### D. Modal Dialog Konfirmasi Hapus
* Penghapusan baris data tiket wajib meminta konfirmasi dengan dialog modal atau *native confirmation*:
  `"Apakah Anda yakin ingin menghapus tiket nomor [NOMOR_TIKET]?"`
