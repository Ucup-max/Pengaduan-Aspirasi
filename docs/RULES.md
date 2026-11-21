# AI Coding & Security Guardrails
## Petunjuk Mutlak Pengembangan - Sistem Help Desk Ticket

Dokumen ini merupakan aturan wajib bagi seluruh AI Coding Assistant dan pengembang software. Pelanggaran terhadap aturan di bawah ini dianggap sebagai kegagalan sistematis (*fatal error*).

---

### 1. Kepatuhan Skema Database & Spesifikasi SKPL
* **Nama Tabel:** Wajib menggunakan nama tabel `tickets` (huruf kecil, jamak). Dilarang mengubah menjadi `pengaduan`, `ticket`, atau `aspirasi`.
* **Nama Kolom:** Wajib 100% identik dengan Modul 2 SKPL:
  - `id`
  - `nomor_tiket`
  - `nama_pelapor`
  - `kategori`
  - `deskripsi`
  - `status`
* **Status Enum Nilai:** Hanya menerima salah satu dari 3 nilai: `'Pending'`, `'Diproses'`, `'Selesai'`. Huruf besar/kecil harus konsisten.

---

### 2. Aturan Mutlak Anti-XSS (`SEC-01`)
* **DILARANG KERAS:** Menggunakan properti `.innerHTML`, `outerHTML`, atau `document.write()` untuk merender data yang berasal dari input pengguna maupun hasil query database.
* **WAJIB:** Menggunakan manipulasi DOM aman melalui metode `.textContent`:
  ```javascript
  // BENAR & AMAN:
  const tdNama = document.createElement('td');
  tdNama.textContent = ticket.nama_pelapor;
  
  const pDeskripsi = document.createElement('p');
  pDeskripsi.textContent = ticket.deskripsi;
  ```
* **Fungsi Sanitasi Wajib:** Jika perenderan template literal string benar-benar diperlukan, seluruh variabel string wajib melewati fungsi escape sanitasi berikut:
  ```javascript
  function escapeHtml(unsafeStr) {
    if (typeof unsafeStr !== 'string') return unsafeStr;
    return unsafeStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  ```
* **Verifikasi:** Payload `<img src=x onerror=alert(1)>` harus tertulis sebagai teks biasa di browser dan tidak boleh mengeksekusi alert script.

---

### 3. Aturan Mutlak Validasi Input (`TC-01` & `TC-02`)
* Dilarang bergantung hanya pada atribut HTML5 seperti `required` atau `maxlength` (karena dapat di-bypass via DevTools / Inspect Element).
* **Validasi Logika JavaScript Mandiri:**
  Sebelum *payload* dikirimkan ke Supabase, fungsi submit wajib melakukan pengecekan string setelah di-*trim*:
  ```javascript
  const deskripsiInput = document.getElementById('deskripsi').value.trim();
  const namaPelaporInput = document.getElementById('nama_pelapor').value.trim();

  // Pengujian TC-01:
  if (!deskripsiInput) {
    showAlertError('Deskripsi wajib diisi');
    document.getElementById('deskripsi').focus();
    return; // Hentikan eksekusi, cegah request API
  }

  if (!namaPelaporInput) {
    showAlertError('Nama pelapor wajib diisi');
    document.getElementById('nama_pelapor').focus();
    return;
  }
  ```
* Pesan peringatan wajib **PERSIS SAMA** dengan kontrak pengujian SKPL: `"Deskripsi wajib diisi"`.

---

### 4. Aturan Keamanan Kredensial & API Key (`SEC-02`)
* File frontend (`index.html`, `app.js`, dll.) **HANYA BOLEH** memuat:
  1. `SUPABASE_URL` (URL endpoint project Supabase).
  2. `SUPABASE_ANON_KEY` (Kunci publik aman untuk browser).
* **DILARANG KERAS** menyematkan kunci privat:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STITCH_API_KEY`
  - Database Direct Connection String (Postgres URI dengan password master)
* Seluruh hak akses publik dibatasi oleh konfigurasi Row Level Security (RLS) di database Supabase.
