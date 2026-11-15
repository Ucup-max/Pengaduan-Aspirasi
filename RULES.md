# AI Coding & Security Guardrails
## Pedoman Hukum & Integritas Kode untuk AI Assistant

Dokumen ini berisi instruksi wajib yang tidak boleh dilanggar oleh AI Coding Assistant saat menulis, merefaktor, atau mengaudit kode sumber aplikasi Help Desk Ticket.

---

## 1. Kepatuhan Skema & Spesifikasi SKPL
1. **Nama Tabel Tunggal:** Wajib menggunakan nama tabel `tickets`. Dilarang menggunakan nama lain seperti `ticket`, `pengaduan`, atau `complaints`.
2. **Nama Field/Kolom Mutlak Identik:**
   * `id`
   * `nomor_tiket`
   * `nama_pelapor`
   * `kategori`
   * `deskripsi`
   * `status`
   * `created_at`
3. **Pilihan Status Terikat:** Status penanganan tiket HANYA boleh bernilai salah satu dari 3 nilai: `'Pending'`, `'Diproses'`, atau `'Selesai'`.

---

## 2. Aturan Mutlak Anti-XSS (`SEC-01`)
Celah Cross-Site Scripting (XSS) adalah pelanggaran fatal. Pengguna dapat menginput payload berbahaya seperti `<img src=x onerror=alert(1)>` atau `<script>`.

### Aturan Eksekusi DOM:
1. **DILARANG KERAS** menyisipkan data dinamis dari database atau form input langsung ke dalam elemen HTML menggunakan:
   * `.innerHTML = ...`
   * `element.outerHTML = ...`
   * `document.write(...)`
2. **WAJIB** merender data tekstual dinamis menggunakan properti aman:
   * Gunakan `element.textContent = data;` pada elemen DOM yang dibuat via `document.createElement()`.
3. **Fungsi Sanitasi Wajib:** Jika perenderan template literals (` `) terpaksa digunakan untuk baris tabel, seluruh variabel dinamis WAJIB dibungkus dengan fungsi sanitasi entitas HTML:
   ```javascript
   function escapeHtml(str) {
     if (typeof str !== 'string') return str ?? '';
     return str
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');
   }
   ```

---

## 3. Aturan Mutlak Validasi Logika Frontend (`TC-01` & `TC-02`)
1. **Jangan Percaya Validasi HTML Saja:** Atribut HTML seperti `required`, `maxlength`, atau `pattern` sangat mudah dihilangkan oleh pengguna awam via menu *Inspect Element*.
2. **Validasi JavaScript Wajib Sebelum Request Supabase:**
   * Sebelum fungsi `supabase.from('tickets').insert(...)` atau `.update(...)` dipanggil, validasi logika wajib dijalankan:
   ```javascript
   const deskripsiBersih = inputDeskripsi.value.trim();
   if (!deskripsiBersih || deskripsiBersih.length === 0) {
     // Tampilkan pesan tepat sesuai SKPL TC-01
     showErrorAlert("Deskripsi wajib diisi");
     inputDeskripsi.focus();
     return; // Hentikan eksekusi segera
   }
   ```
3. **Pesan Validasi Tepat:** Pesan kesalahan untuk skenario `TC-01` WAJIB bertuliskan persis: `"Deskripsi wajib diisi"`. Dilarang mengganti menjadi sinonim lain (misal: "Harap isi deskripsi" atau "Kolom tidak boleh kosong").

---

## 4. Aturan Keamanan Kredensial & Secrets (`SEC-02`)
1. **Hanya Public Anon Key:** Berkas frontend (`index.html` / `app.js`) HANYA diizinkan memuat `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
2. **LARANGAN MUTLAK Secret Keys:**
   * DILARANG KERAS menaruh `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_PASSWORD`, atau `STITCH_API_KEY` di file client-side.
   * Service Role Key memiliki hak akses *bypass* terhadap Row Level Security (RLS) dan membahayakan seluruh database jika bocor ke browser pengguna.
