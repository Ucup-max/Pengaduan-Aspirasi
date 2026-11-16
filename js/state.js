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

// Seed Initial Data (Kosong default untuk produksi bersih)
const initialTicketsData = [];

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

// LocalStorage Helpers
function loadStorage() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTicketsData));
    return [...initialTicketsData];
  }
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    return [...initialTicketsData];
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
  const currentPelaporInput = document.getElementById('nama_pelapor');
  const activeStudentName = (currentPelaporInput ? currentPelaporInput.value.trim() : '') || 'Fadhol Afif';

  const myTickets = [];
  const addedNumbers = new Set();

  // 1. Ambil tiket yang nomornya ada di daftar nomor tiket yang pernah diajukan/dilacak di browser ini
  savedNumbers.forEach(num => {
    const t = ticketsState.find(item => item.nomor_tiket === num);
    if (t && !addedNumbers.has(t.nomor_tiket)) {
      myTickets.push(t);
      addedNumbers.add(t.nomor_tiket);
    }
  });

  // 2. Ambil tiket yang nama pelapornya cocok dengan nama mahasiswa aktif
  ticketsState.forEach(t => {
    const isNameMatch = activeStudentName && t.nama_pelapor && t.nama_pelapor.toLowerCase().trim() === activeStudentName.toLowerCase().trim();
    if (isNameMatch && !addedNumbers.has(t.nomor_tiket)) {
      myTickets.push(t);
      addedNumbers.add(t.nomor_tiket);
    }
  });

  // 3. Fallback: jika belum ada tiket yang diajukan tapi ada data di ticketsState (misal saat inisialisasi awal)
  if (myTickets.length === 0 && ticketsState.length > 0) {
    return [...ticketsState];
  }

  return myTickets;
}
