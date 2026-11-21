/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - STATE & DATA STORE LAYER
   Separation of Concerns: Application State & LocalStorage Persistence
   ========================================================================= */

// Runtime State Variables
let supabaseClient = null;
let isCloudMode = false;
let ticketsState = [];
let currentSelectedTicket = null;
let isRecentSubmission = false;
let currentRole = localStorage.getItem('APP_USER_ROLE') || 'mahasiswa';
let currentAttachmentBase64 = null;

// Initial Demo Tickets (Memiliki lokasi, riwayat waktu, dan catatan petugas)
const initialTicketsData = [
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

// Generator ID Tiket Resmi (Format: ASP-XXXXXX)
function generateNewTicketId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const newId = `ASP-${randomNum}`;
  const input = document.getElementById('nomor_tiket');
  if (input) {
    input.value = newId;
  }
  return newId;
}

// Ensure each ticket has complete fallback fields
function sanitizeTicketObject(t) {
  if (!t) return t;
  return {
    id: t.id || Date.now(),
    nomor_tiket: t.nomor_tiket || 'ASP-000000',
    nama_pelapor: t.nama_pelapor || 'Sivitas Kampus',
    nama_asli: t.nama_asli || t.nama_pelapor || 'Sivitas Kampus',
    pelapor_id: t.pelapor_id || '',
    is_anonim: !!t.is_anonim,
    kategori: t.kategori || 'Fasilitas Kampus',
    lokasi: t.lokasi || 'Lingkungan Kampus',
    deskripsi: t.deskripsi || '',
    status: t.status || 'Pending',
    lampiran_foto: t.lampiran_foto || null,
    catatan_penanganan: t.catatan_penanganan || '',
    created_at: t.created_at || new Date().toISOString(),
    riwayat: Array.isArray(t.riwayat) && t.riwayat.length > 0 ? t.riwayat : [
      {
        status: t.status || 'Pending',
        waktu: t.created_at || new Date().toISOString(),
        catatan: t.catatan_penanganan || 'Aspirasi tercatat di antrean sistem.',
        petugas: 'Helpdesk'
      }
    ],
    konfirmasi_selesai: !!t.konfirmasi_selesai,
    rating: t.rating || null,
    feedback: t.feedback || ''
  };
}

// LocalStorage Helpers
function loadStorage() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTicketsData));
    return initialTicketsData.map(sanitizeTicketObject);
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTicketsData));
      return initialTicketsData.map(sanitizeTicketObject);
    }
    return parsed.map(sanitizeTicketObject);
  } catch (e) {
    return initialTicketsData.map(sanitizeTicketObject);
  }
}

function saveLocalStorage(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

// Multi-Ticket Local History Helpers
function getMySubmittedTicketNumbers() {
  try {
    const raw = localStorage.getItem(MY_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveMySubmittedTicketNumber(ticketNum) {
  if (!ticketNum) return;
  try {
    const list = getMySubmittedTicketNumbers();
    if (!list.includes(ticketNum)) {
      list.unshift(ticketNum);
      localStorage.setItem(MY_TICKETS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Gagal menyimpan riwayat nomor tiket lokal:', e);
  }
}

function getMyTickets() {
  const savedNumbers = getMySubmittedTicketNumbers();
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const userNim = currentUser ? (currentUser.nim || currentUser.username || '') : '';
  const currentPelaporInput = document.getElementById('nama_pelapor');
  const activeStudentName = (currentPelaporInput ? currentPelaporInput.value.trim() : '') || (currentUser ? currentUser.nama : '');

  const myTickets = [];
  const addedNumbers = new Set();

  // 1. Ambil tiket yang nomornya ada di daftar nomor tiket yang pernah diajukan di browser ini
  savedNumbers.forEach(num => {
    const t = ticketsState.find(item => item.nomor_tiket === num);
    if (t && !addedNumbers.has(t.nomor_tiket)) {
      myTickets.push(t);
      addedNumbers.add(t.nomor_tiket);
    }
  });

  // 2. Ambil tiket yang pelapor_id cocok dengan NIM mahasiswa aktif (termasuk tiket anonim miliknya)
  if (userNim) {
    ticketsState.forEach(t => {
      const isIdMatch = t.pelapor_id && String(t.pelapor_id).trim() === String(userNim).trim();
      if (isIdMatch && !addedNumbers.has(t.nomor_tiket)) {
        myTickets.push(t);
        addedNumbers.add(t.nomor_tiket);
      }
    });
  }

  // 3. Ambil tiket yang nama pelapornya atau nama aslinya cocok dengan nama mahasiswa aktif
  if (activeStudentName) {
    ticketsState.forEach(t => {
      const matchNama = (t.nama_pelapor && t.nama_pelapor.toLowerCase().trim() === activeStudentName.toLowerCase().trim()) ||
                        (t.nama_asli && t.nama_asli.toLowerCase().trim() === activeStudentName.toLowerCase().trim());
      if (matchNama && !addedNumbers.has(t.nomor_tiket)) {
        myTickets.push(t);
        addedNumbers.add(t.nomor_tiket);
      }
    });
  }

  // 4. Fallback: jika belum ada tiket yang diajukan tapi ada data di ticketsState
  if (myTickets.length === 0 && ticketsState.length > 0) {
    return [...ticketsState];
  }

  return myTickets;
}
