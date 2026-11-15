Create a modern, clean, and highly responsive web application dashboard for a "Help Desk Ticket & Aspirations System" (Sistem Pengaduan dan Aspirasi) using HTML5 and Tailwind CSS. The design must be sleek, professional, accessible, and structured into a 2-column productivity layout with the following exact specifications:

1. Top Navigation Bar:
   - Application title: "Help Desk Ticket System" with an official, modern support badge.
   - Professional subtitle: "Sistem Pengaduan & Aspirasi Layanan Terpadu".
   - Top-right status pill: A dynamic database connection indicator featuring a subtle pulsing green dot and text "Supabase Connected".

2. Top KPI / Metric Summary Cards (3 Responsive Cards Grid):
   - Card 1 (Total Laporan): Indigo accent theme, showing total registered tickets with an inbox/ticket icon.
   - Card 2 (Dalam Penanganan): Amber/Yellow accent theme, showing tickets currently with 'Pending' or 'Diproses' status with a clock/processing icon.
   - Card 3 (Laporan Selesai): Emerald/Green accent theme, showing resolved tickets with 'Selesai' status with a checkmark badge icon.
   - All cards should feature modern white background (`bg-white`), subtle border (`border border-slate-200`), rounded corners (`rounded-xl`), and soft drop-shadow (`shadow-sm`).

3. Main Workspace Layout (Two-Column Responsive Grid on Desktop, Stacked on Mobile):
   - Left Column (Input Form & Ticket Submission Panel - approx 35-40% width):
     - Card header: "Buat Laporan Pengaduan" with clear instructions.
     - Dynamic Alert Error Banner: A styled red warning container (`bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4 hidden`) containing an alert icon and placeholder for validation errors, specifically: "Deskripsi wajib diisi".
     - Form Fields:
       * Nomor Tiket: Read-only preview input field pre-filled with auto-generated code format (e.g., "TKT-20261115-001") with a subtle gray background.
       * Nama Pelapor: Text input with placeholder "Masukkan nama lengkap pelapor".
       * Kategori: Dropdown select with options: "Layanan Publik", "Kendala Teknis", "Sarana & Prasarana", "Aspirasi & Masukan".
       * Deskripsi Laporan: Multi-line textarea (min 4 rows) with placeholder "Tuliskan rincian keluhan atau kendala Anda secara lengkap...".
       * Status Tiket: Dropdown select with options: "Pending", "Diproses", "Selesai" (defaults to "Pending").
     - Form Action Buttons:
       * Primary submit button: "Kirim Pengaduan" (`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm w-full`).
       * Secondary reset/cancel button: "Batal / Reset" (`bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-lg hidden`).

   - Right Column (Data Table, Search, and Live Filtering - approx 60-65% width):
     - Controls Header Bar:
       * Search Bar: Search input with magnifying glass icon and placeholder "Cari nomor tiket, pelapor, atau keluhan...".
       * Status Filter: Quick filter dropdown with options "Semua Status", "Pending", "Diproses", "Selesai".
       * Category Filter: Quick filter dropdown for categories.
     - Responsive Ticket Table:
       * Styled table with light gray header (`bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider`).
       * Table columns: "No. Tiket", "Pelapor", "Kategori", "Deskripsi", "Status", and "Aksi".
       * Status Badges:
         - "Pending" rendered as yellow/amber badge (`bg-amber-100 text-amber-800 border border-amber-200`).
         - "Diproses" rendered as blue badge (`bg-blue-100 text-blue-800 border border-blue-200`).
         - "Selesai" rendered as green badge (`bg-emerald-100 text-emerald-800 border border-emerald-200`).
       * Action Column: Two neat icon/text buttons per row:
         - "Edit Status" button (`text-indigo-600 hover:text-indigo-900 text-xs font-semibold`).
         - "Hapus" button (`text-rose-600 hover:text-rose-900 text-xs font-semibold`).
     - Empty State Display: Clean fallback banner when no data matches search/filter, displaying a friendly support illustration/icon and message "Belum ada tiket pengaduan".

4. Aesthetic Guidelines:
   - Primary color: Indigo-600 (`#4f46e5`).
   - Page background: Slate-50 (`#f8fafc`).
   - Typography: Clean sans-serif ('Inter' or 'Plus Jakarta Sans').
   - Subtle hover effects, smooth transitions (`transition-all duration-200`), rounded borders (`rounded-xl`), and modern accessible spacing.
