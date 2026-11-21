import { Ticket, UserAccount, TicketCategoryItem } from '@/types';

export const AUTH_COOKIE_NAME = 'aspirasi_session_user';

export const DOSEN_PASSWORD = 'S!I76yQDVMCKaNRrKP1FAj';

export const USER_ACCOUNTS: UserAccount[] = [
  { nim: "260102003", nama: "NESHRIN FEBRILIANA", kelas: "TI1D", username: "260102003", password: "S!G-JYoJcLf1uvZgCDtcaT", role: "mahasiswa" },
  { nim: "260102013", nama: "BIMO KUSUMA BRAHMANTYO", kelas: "TI1D", username: "260102013", password: "S!PtmzqFBUtehgbv6S08eK", role: "mahasiswa" },
  { nim: "260102017", nama: "DIVA AULIA NITISANDRA", kelas: "TI1D", username: "260102017", password: "S!0gi3wSHy9Zm2RSWa072N", role: "mahasiswa" },
  { nim: "260102020", nama: "FIRZY KUSUMA ARGINATA", kelas: "TI1D", username: "260102020", password: "S!bzeEz6ANjAB8gaxokESf", role: "mahasiswa" },
  { nim: "260102024", nama: "LAILATUN NIHAYAH", kelas: "TI1D", username: "260102024", password: "S!j0WWLIcGoJDv5-KDRIZw", role: "mahasiswa" },
  { nim: "260102027", nama: "MUZZAMIL YAHYA ALFAQIH", kelas: "TI1D", username: "260102027", password: "S!8E3HN67oYPK4shYmZokT", role: "mahasiswa" },
  { nim: "260102032", nama: "RAYZA AULIA MAHARANI", kelas: "TI1D", username: "260102032", password: "S!g15dtrTQiJM_BiVL1h46", role: "mahasiswa" },
  // KHUSUS: YUSUF ANGGIT PRASETYO DITETAPKAN SEBAGAI DOSEN (AKSES PENUH)
  { nim: "260102037", nama: "YUSUF ANGGIT PRASETYO", kelas: "TI1D", username: "260102037", password: "S!I76yQDVMCKaNRrKP1FAj", role: "dosen" },
  { nim: "260102040", nama: "TRI NUGRAHA UGA SAPUTRA", kelas: "TI1D", username: "260102040", password: "S!4AOQmLrw1P8Roov0MFip", role: "mahasiswa" },
  { nim: "260102042", nama: "APRILIA NUR FATIMAH", kelas: "TI1D", username: "260102042", password: "S!NBgtafmKhO-2nHrGUPO9", role: "mahasiswa" },
  { nim: "260202001", nama: "PUTRA RIZKI APRILIAN", kelas: "TI1D", username: "260202001", password: "S!kgZQcwaNPw0v6V73Wc8Q", role: "mahasiswa" },
  { nim: "260202013", nama: "SYAFA AFIFAH MUDIYANTI", kelas: "TI1D", username: "260202013", password: "S!sOnUTBUW6v9AHZ9P-0Nh", role: "mahasiswa" },
  { nim: "260202017", nama: "RAHAYU NUR KHASANAH", kelas: "TI1D", username: "260202017", password: "S!Dx0Zvm9XJcNU9-jaif8W", role: "mahasiswa" },
  { nim: "260202025", nama: "BAGAS TRI PAMUNGKAS", kelas: "TI1D", username: "260202025", password: "S!bHED2Bsh5-XPWeCNfp7U", role: "mahasiswa" },
  { nim: "260202026", nama: "NAURA NURUL HIZQIYAH", kelas: "TI1D", username: "260202026", password: "S!ZPqCOY2u-7mfNgaLx-Be", role: "mahasiswa" },
  { nim: "260202037", nama: "MIDHFARUL MUNA NAJWAN", kelas: "TI1D", username: "260202037", password: "S!e6PuSyroO7cQNayt-KlI", role: "mahasiswa" },
  { nim: "260202043", nama: "AJRIL GUSYANA", kelas: "TI1D", username: "260202043", password: "S!jFBx_pfHspz9nl7y3qr_", role: "mahasiswa" },
  { nim: "260202045", nama: "HARDYANTI", kelas: "TI1D", username: "260202045", password: "S!pU_BekTGu5590veh_aj0", role: "mahasiswa" },
  { nim: "260202049", nama: "YUDISTIRA BAGUS WIJAYA", kelas: "TI1D", username: "260202049", password: "S!8Un1EtLtk2kD_e3vdvvj", role: "mahasiswa" },
  { nim: "260302012", nama: "RAIHAN RAFI NUR RAHMAN", kelas: "TI1D", username: "260302012", password: "S!EgmepJybg8iFYIyBj3Gr", role: "mahasiswa" },
  { nim: "260302014", nama: "PUTRI AMELIA", kelas: "TI1D", username: "260302014", password: "S!CeyQvogXLYZbFqvoes7Z", role: "mahasiswa" },
  { nim: "260302020", nama: "YUDISTIRA TRI LAKSONO", kelas: "TI1D", username: "260302020", password: "S!clnFBSxGGk4g7apGnJqH", role: "mahasiswa" },
  { nim: "260302026", nama: "FADHOL AFIF AFRIYANTO", kelas: "TI1D", username: "260302026", password: "S!FHOFaADpCAlUcG1uGGN6", role: "mahasiswa" },
  { nim: "260302033", nama: "DAVA ATASSYAH PUTRA", kelas: "TI1D", username: "260302033", password: "S!kRsxMn3-XStbVxlqaEvW", role: "mahasiswa" },
  { nim: "260302035", nama: "ATHARRAHMAN FAIZUL ANWAR", kelas: "TI1D", username: "260302035", password: "S!jgmYZ7LFTh803oliHAkA", role: "mahasiswa" },
  { nim: "260302036", nama: "LYLLA ARTHA NAURA", kelas: "TI1D", username: "260302036", password: "S!V310PN7_EdTGzFRkaf3Y", role: "mahasiswa" },
  { nim: "260302047", nama: "DIMAS NABIL NUGROHO", kelas: "TI1D", username: "260302047", password: "S!1KA_iftGDSki_MO3CrK2", role: "mahasiswa" },
  { nim: "260302048", nama: "RISKA ASTUTI", kelas: "TI1D", username: "260302048", password: "S!D7OED9ncnZG9YEwrdEoH", role: "mahasiswa" },
  { nim: "260302049", nama: "NAJMA MAHAWA AULIA RAHMA", kelas: "TI1D", username: "260302049", password: "S!bMedktQEPcIk0rFXb5bN", role: "mahasiswa" },
  { nim: "260302052", nama: "AIDHA NURDZULLAIKHA", kelas: "TI1D", username: "260302052", password: "S!1-6sRsrsfciYerl17lly", role: "mahasiswa" },
  { nim: "260302059", nama: "IRFAN DWI MEIRAMDANI", kelas: "TI1D", username: "260302059", password: "S!kzppitMZXUKHM8I0xyFM", role: "mahasiswa" }
];

export const DEMO_MAHASISWA: UserAccount = {
  nim: "260302026",
  nama: "Fadhol Afif Afriyanto",
  kelas: "TI1D",
  username: "260302026",
  password: "S!FHOFaADpCAlUcG1uGGN6",
  role: "mahasiswa"
};

export const DEMO_DOSEN: UserAccount = {
  nim: "260102037",
  nama: "Yusuf Anggit Prasetyo",
  kelas: "TI1D",
  username: "260102037",
  password: "S!I76yQDVMCKaNRrKP1FAj",
  role: "dosen"
};

export const CATEGORIES: TicketCategoryItem[] = [
  {
    id: "Sarana & Prasarana",
    title: "Sarana & Prasarana",
    description: "Kerusakan fasilitas ruang kuliah, pendingin ruangan (AC), proyektor, kelistrikan, dan toilet.",
    icon: "Building",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "Teknologi & Informasi",
    title: "Teknologi & Informasi",
    description: "Masalah jaringan Wi-Fi kampus, sistem SSO/SIAKAD, laboratorium komputer, dan akun email institusi.",
    icon: "Wifi",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: "Akademik & Perkuliahan",
    title: "Akademik & Perkuliahan",
    description: "Kendala jadwal kuliah, ruang sidang, absensi perkuliahan, dan administrasi program studi.",
    icon: "GraduationCap",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "Layanan Administrasi",
    title: "Layanan Administrasi",
    description: "Pengurusan surat keterangan aktif, legalisir transkrip/ijazah, dan pelayanan loket kampus.",
    icon: "FileText",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: "Finansial & Pembayaran",
    title: "Finansial & Pembayaran",
    description: "Permasalahan verifikasi pembayaran UKT, beasiswa mahasiswa, dan rekonsiliasi bank.",
    icon: "CreditCard",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: "Lainnya",
    title: "Lainnya / Umum",
    description: "Aspirasi umum, usulan kegiatan kemahasiswaan, kebersihan lingkungan, atau masukan lain.",
    icon: "HelpCircle",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200"
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 1001,
    nomor_tiket: 'ASP-102931',
    nama_pelapor: 'Ahmad Fauzi',
    nama_asli: 'Ahmad Fauzi',
    pelapor_id: '260102003',
    is_anonim: false,
    kategori: 'Sarana & Prasarana',
    lokasi: 'Gedung F, Lantai 2, Ruang Lab Komputer 3',
    deskripsi: 'Proyektor di ruang Lab Komputer 3 tidak memancarkan layar (lampu indikator berkedip merah saat disambungkan HDMI).',
    status: 'Pending',
    lampiran_foto: null,
    catatan_penanganan: '',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    riwayat: [
      {
        status: 'Pending',
        waktu: new Date(Date.now() - 3600000 * 24).toISOString(),
        catatan: 'Aspirasi resmi diajukan dan masuk ke antrean helpdesk.',
        petugas: 'Sistem'
      }
    ],
    konfirmasi_selesai: false,
    rating: null,
    feedback: ''
  },
  {
    id: 1002,
    nomor_tiket: 'ASP-204819',
    nama_pelapor: 'Sivitas Akademika (Anonim)',
    nama_asli: 'Fadhol Afif Afriyanto',
    pelapor_id: '260302026',
    is_anonim: true,
    kategori: 'Teknologi & Informasi',
    lokasi: 'Gedung Perpustakaan Pusat, Lantai 2',
    deskripsi: 'Koneksi Wi-Fi kampus di Gedung Perpustakaan Lantai 2 sering mengalami kendala autentikasi SSO dan kecepatan menurun drastis.',
    status: 'Diproses',
    lampiran_foto: null,
    catatan_penanganan: 'Teknisi jaringan sedang melakukan restart access point dan pembaruan sertifikat gateway autentikasi.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    riwayat: [
      {
        status: 'Pending',
        waktu: new Date(Date.now() - 3600000 * 12).toISOString(),
        catatan: 'Laporan diterima dan diverifikasi oleh helpdesk.',
        petugas: 'Sistem'
      },
      {
        status: 'Diproses',
        waktu: new Date(Date.now() - 3600000 * 4).toISOString(),
        catatan: 'Teknisi jaringan sedang melakukan restart access point dan pembaruan sertifikat gateway autentikasi.',
        petugas: 'Yusuf Anggit Prasetyo'
      }
    ],
    konfirmasi_selesai: false,
    rating: null,
    feedback: ''
  },
  {
    id: 1003,
    nomor_tiket: 'ASP-305928',
    nama_pelapor: 'Fadhol Afif Afriyanto',
    nama_asli: 'Fadhol Afif Afriyanto',
    pelapor_id: '260302026',
    is_anonim: false,
    kategori: 'Sarana & Prasarana',
    lokasi: 'Gedung Kuliah Bersama, Lantai 1, Toilet Pria Barat',
    deskripsi: 'Keran air pada wastafel kedua mengalami kebocoran pipa sehingga air terus mengalir dan membasahi lantai.',
    status: 'Selesai',
    lampiran_foto: null,
    catatan_penanganan: 'Pipa seal keran wastafel telah diganti baru oleh teknisi fasilitas kampus. Kebocoran sudah teratasi normal.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    riwayat: [
      {
        status: 'Pending',
        waktu: new Date(Date.now() - 3600000 * 48).toISOString(),
        catatan: 'Aspirasi resmi didaftarkan.',
        petugas: 'Sistem'
      },
      {
        status: 'Diproses',
        waktu: new Date(Date.now() - 3600000 * 28).toISOString(),
        catatan: 'Tim sarana prasarana menjadwalkan pengecekan fisik lokasi.',
        petugas: 'Yusuf Anggit Prasetyo'
      },
      {
        status: 'Selesai',
        waktu: new Date(Date.now() - 3600000 * 6).toISOString(),
        catatan: 'Pipa seal keran wastafel telah diganti baru oleh teknisi fasilitas kampus. Kebocoran sudah teratasi normal.',
        petugas: 'Yusuf Anggit Prasetyo'
      }
    ],
    konfirmasi_selesai: false,
    rating: null,
    feedback: ''
  }
];
