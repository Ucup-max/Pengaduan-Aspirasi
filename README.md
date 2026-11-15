# Sistem Pengaduan dan Aspirasi (Help Desk Ticket)
> Aplikasi Web Modern Penanganan Tiket Pengaduan Publik & Dukungan Teknis Berbasis **Spec-Driven Vibe Coding** dengan Supabase PostgreSQL & Tailwind CSS.

[![Status](https://img.shields.io/badge/Security-XSS%20Immune-emerald)](#keamanan)
[![Testing](https://img.shields.io/badge/BlackBox%20Testing-Passed-blue)](#pengujian)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e)](#database)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-black)](#deployment)

---

## 📌 Ringkasan Proyek

Proyek ini dibangun dalam rangka **Workshop JKB X PERMIKOMNAS** dengan menerapkan metodologi **Spec-Driven Vibe Coding**: alur rekayasa perangkat lunak modern yang mengombinasikan dokumen spesifikasi formal (SKPL & PRD), desain antarmuka berbasis Penpot / Google Stitch, aturan keamanan (*guardrails*), dan pengujian otomatis Black Box Testing serta Anti-XSS.

Aplikasi ini menampung, memproses, dan memantau status pengaduan serta aspirasi pengguna secara transparan dengan penerbitan nomor tiket otomatis, filter kategori, dan kartu metrik dinamis.

---

## 🏗️ Arsitektur Spec-Driven Vibe Coding

```
                                +-------------------+
                                |    SKPL Dokumen   |
                                +---------+---------+
                                          |
                                          v
                                +-------------------+
                                |  PRD.md & RULES   |
                                +---------+---------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
            +-------------------+                   +-------------------+
            |  UI/UX di Penpot  |                   |  PostgreSQL / RLS |
            |  & Google Stitch  |                   |  supabase_schema  |
            +---------+---------+                   +---------+---------+
                      |                                       |
                      +-------------------+-------------------+
                                          |
                                          v
                                +-------------------+
                                |    index.html     |
                                | Tailwind + SDK v2 |
                                +---------+---------+
                                          |
                                          v
                                +-------------------+
                                |  QA & Black Box   |
                                |  TC-01,02 & SEC   |
                                +-------------------+
```

---

## ✨ Fitur Utama Aplikasi

* **REQ-01 (Pengajuan Pengaduan):** Form pembuatan tiket dengan penomoran unik otomatis (`ADU-YYYY-XXXX`), validasi kelengkapan nama, kategori aduan, dan deskripsi detail masalah.
* **REQ-02 (Manajemen & Pembaruan Status):** Petugas dapat mengubah tahapan penanganan tiket (`Pending` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai`) yang langsung tersinkronisasi ke database.
* **REQ-03 (Dashboard & Ringkasan Metrik):** 3 Kartu Ringkasan (KPI Cards) dinamis untuk memantau Total Laporan Masuk, Laporan Dalam Penanganan, dan Laporan Selesai.
* **REQ-04 (Pencarian, Filter, & Penghapusan):** Pencarian instan kata kunci, pemfilteran berdasarkan status & kategori, serta penghapusan baris data dengan konfirmasi modal.
* **Mode Fallback Cerdas:** Mendukung eksekusi Cloud Supabase secara *real-time* sekaligus penyimpanan lokal otomatis (*LocalStorage*) jika belum terhubung ke internet.

---

## 🧪 Hasil Pengujian Black Box & Keamanan

Seluruh skenario pengujian telah diaudit secara formal pada berkas [AUDIT_REPORT.md](AUDIT_REPORT.md) dengan status **100% LULUS (PASS)**:

| ID Uji | Tipe Pengujian | Skenario Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Black Box | Submit deskripsi kosong (`""`) | Sistem menolak simpan, form tidak terkirim, dan memunculkan banner alert merah: **"Deskripsi wajib diisi"**. | **PASSED** |
| **TC-02** | Black Box | Pembaruan status tiket | Status tiket berhasil diupdate menjadi **"Diproses"** dan tercermin pada dashboard secara akurat. | **PASSED** |
| **SEC-01**| Application Sec | Uji Injeksi XSS (`<img src=x onerror=alert(1)>`) | Tag berbahaya dinetralisir menggunakan `.textContent` DOM manipulation. Skrip tidak pernah tereksekusi. | **PASSED** |
| **SEC-02**| DevSecOps | Audit Kredensial Frontend | Bebas dari kebocoran `service_role` key, master password, maupun secret tokens. | **PASSED** |

---

## 🗄️ Skema Database (Supabase PostgreSQL)

Aplikasi menggunakan tabel tunggal `tickets` yang diperkuat dengan constraint tingkat database dan Row Level Security (RLS):

```sql
-- Dikutip dari supabase_schema.sql
CREATE TABLE IF NOT EXISTS public.tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomor_tiket VARCHAR(30) NOT NULL UNIQUE,
    nama_pelapor VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    deskripsi TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT ck_tickets_deskripsi_not_empty CHECK (length(trim(deskripsi)) > 0),
    CONSTRAINT ck_tickets_status_valid CHECK (status IN ('Pending', 'Diproses', 'Selesai'))
);
```

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/USERNAME/helpdesk-ticket-system.git
   cd helpdesk-ticket-system
   ```

2. **Jalankan Aplikasi:**
   * Buka berkas `index.html` menggunakan browser modern (Chrome, Edge, Firefox), atau
   * Gunakan ekstensi **Live Server** pada VS Code (`Right Click > Open with Live Server`).

3. **Konfigurasi Supabase (Opsional untuk Cloud Sync):**
   * Buat proyek baru di [Supabase Dashboard](https://supabase.com/).
   * Eksekusi seluruh script di berkas `supabase_schema.sql` pada menu **SQL Editor**.
   * Buka file `index.html` dan isi `SUPABASE_URL` serta `SUPABASE_ANON_KEY` pada baris 482.

---

## 🌐 Panduan Deployment ke Vercel (Gratis & Cepat)

Proyek ini berupa Single-Page Static Web Application sehingga dapat di-deploy ke **Vercel** dalam hitungan detik tanpa build configuration:

1. **Push Proyek ke GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete help desk ticketing app with spec-driven vibe coding"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
2. **Import ke Vercel:**
   * Buka [vercel.com](https://vercel.com/) dan login menggunakan akun GitHub Anda.
   * Klik tombol **"Add New..." > "Project"**.
   * Pilih repositori GitHub proyek ini, lalu klik **"Import"**.
3. **Deploy:**
   * Biarkan pengaturan Framework Preset pada pilihan **Other** (karena murni Static HTML/JS).
   * Klik tombol **"Deploy"**.
   * Dalam ~15 detik, aplikasi Anda sudah live dan memiliki URL publik aktif (misal: `https://helpdesk-ticket.vercel.app`).

---

## 📁 Struktur Direktori Repositori

```
├── .gitignore              # Proteksi pencegahan kebocoran file rahasia/env
├── AUDIT_REPORT.md         # Laporan formal verifikasi QA Black Box & Security
├── DESIGN.md               # Pedoman Design System Tailwind CSS & UI rules
├── PRD.md                  # Product Requirements Document & pemetaan REQ
├── RULES.md                # Aturan hukum coding mutlak & pedoman Anti-XSS
├── STITCH_PROMPT.md        # Prompt rekayasa antarmuka untuk Google Stitch
├── index.html              # Antarmuka web utama + Integrasi Supabase JS v2
├── supabase_schema.sql     # Skrip DDL PostgreSQL, RLS Policies, & Dummy Data
└── README.md               # Dokumentasi portofolio proyek
```

---

**Dikembangkan untuk:** Workshop JKB X PERMIKOMNAS &bull; *Spec-Driven Vibe Coding Excellence*
