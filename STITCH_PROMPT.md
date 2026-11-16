# Prompt Desain UI/UX untuk Google Stitch

Prompt di bawah ini siap langsung disalin dan ditempelkan ke [Google Stitch](https://stitch.withgoogle.com/) untuk menghasilkan antarmuka web modern berbasis Tailwind CSS:

```text
Create a modern, clean, and highly responsive Help Desk and Student Aspiration Ticketing System dashboard web interface styled with Tailwind CSS.

1. Layout & Theme:
- Background color: Light slate gray (`bg-slate-50`).
- Modern font typography (Inter or Plus Jakarta Sans), crisp borders (`border-slate-200`), rounded corners (`rounded-xl`), and soft elevation shadows (`shadow-sm`).

2. Header Navigation Bar:
- Left: App icon (ticket/support badge) with Application Title "Sistem Pengaduan & Aspirasi" and subtitle "Help Desk Ticket Management Portal".
- Right: A pill-shaped real-time connection status badge showing a green pulsing indicator with the label "Supabase Connected".

3. Summary / KPI Cards (Top 3 Metrics Grid):
- Card 1 (Total Tiket): Display total incoming tickets with a neutral slate/indigo icon badge.
- Card 2 (Tiket Pending): Display pending tickets waiting for action with an amber/warning badge ("Menunggu Penanganan").
- Card 3 (Tiket Diproses & Selesai): Display processed and resolved tickets with an emerald/green success indicator ("Selesai / Ditangani").

4. Main Content - Responsive Split 2-Column Layout (Desktop: 4 cols left, 8 cols right; Mobile: stacked):
- Left Column (Ticket Submission & Edit Form Card):
  * White card with a clear header: "Form Pengaduan Aspirasi".
  * Sub-header that toggles to "Mode Edit Tiket" when editing.
  * An Alert Error Box (hidden by default, red background `bg-rose-50`, red text `text-rose-700`, border `border-rose-200`, with warning icon) designed to strictly display validation messages such as "Deskripsi wajib diisi".
  * Input field for "Nomor Tiket" (pre-generated unique badge/readonly or styled text input, e.g., TKT-20261115-001).
  * Input field for "Nama Pelapor" (placeholder: "Masukkan nama lengkap pelapor").
  * Dropdown select for "Kategori" (Options: Sarana & Prasarana, Akademik, Layanan Publik, Keuangan, Teknologi/TI, Lainnya).
  * Dropdown select for "Status Tiket" (Options: Pending, Diproses, Selesai).
  * Textarea for "Deskripsi Pengaduan" (placeholder: "Tuliskan detail kendala atau aspirasi secara lengkap...", min 4 rows).
  * Action button row: Primary submit button ("Kirim Aduan / Simpan") with an indigo accent (`bg-indigo-600 hover:bg-indigo-700 text-white`), and a secondary button ("Reset / Batal Edit") with a clean outline style.

- Right Column (Ticket Management & Real-time Table Card):
  * Card header: "Daftar Tiket & Riwayat Aduan".
  * Interactive Control Bar: Search input field with search magnifying glass icon ("Cari nomor tiket, pelapor, atau kata kunci...") and category/status filter dropdown buttons.
  * Modern Responsive Data Table:
    - Columns: Nomor Tiket, Nama Pelapor, Kategori, Deskripsi (truncated with tooltip), Status, Aksi.
    - Status Badges:
      * "Pending": Amber badge (`bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`).
      * "Diproses": Blue badge (`bg-sky-50 text-sky-700 ring-1 ring-sky-600/20`).
      * "Selesai": Emerald badge (`bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`).
    - Action Column: Two compact icon buttons per row: "Edit" (pencil icon, blue hover) and "Hapus" (trash icon, rose hover).
  * Empty State placeholder illustration when no records match filter, and pagination/item counter footer ("Menampilkan X dari Y tiket").
```
