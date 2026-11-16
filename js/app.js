/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - APP CONTROLLER & BOOTSTRAP LAYER
   Separation of Concerns: Application Initialization, Search & Event Controllers
   ========================================================================= */

/* =========================================================================
   1. LOGIKA PENCARIAN TIKET (SMART LOOKUP, ENTER HANDLER & GLOBAL SEARCH)
   ========================================================================= */
function findTicketSmart(query) {
  if (!query || !ticketsState || ticketsState.length === 0) return null;
  const q = query.trim().toUpperCase();
  const qClean = q.replace(/[^A-Z0-9]/g, '');

  return ticketsState.find(t => {
    const tNum = (t.nomor_tiket || '').toUpperCase();
    const tNumClean = tNum.replace(/[^A-Z0-9]/g, '');

    // 1. Cocok persis (misal: "ASP-323484" === "ASP-323484")
    if (tNum === q) return true;
    // 2. Cocok tanpa tanda strip (misal: "ASP323484" === "ASP-323484")
    if (tNumClean === qClean) return true;
    // 3. Cocok nomornya saja jika user ketik angka (misal: "323484" di "ASP-323484")
    if (qClean.length >= 3 && tNumClean.includes(qClean)) return true;
    // 4. Substring contains
    if (tNum.includes(q)) return true;
    return false;
  });
}

// Handler untuk input search di Top Header (saat tekan Enter)
function handleGlobalSearch() {
  const input = document.getElementById('topSearchInput');
  const val = input ? input.value.trim() : '';

  if (!val) {
    showToast('Ketik nomor tiket atau kata kunci untuk mencari.');
    if (input) input.focus();
    return;
  }

  // 1. Cari nomor tiket dengan smart search
  const found = findTicketSmart(val);
  if (found) {
    populatePage2(found);
    switchPage('page2');
    showToast(`Tiket ${found.nomor_tiket} ditemukan! Menampilkan status.`);
    return;
  }

  // 2. Cari berdasarkan nama pelapor atau kata kunci kendala
  const foundKeyword = ticketsState.find(t =>
    (t.nama_pelapor && t.nama_pelapor.toLowerCase().includes(val.toLowerCase())) ||
    (t.deskripsi && t.deskripsi.toLowerCase().includes(val.toLowerCase())) ||
    (t.kategori && t.kategori.toLowerCase().includes(val.toLowerCase()))
  );

  if (foundKeyword) {
    populatePage2(foundKeyword);
    switchPage('page2');
    showToast(`Ditemukan tiket dari "${foundKeyword.nama_pelapor}" (${foundKeyword.nomor_tiket})`);
    return;
  }

  showToast(`Pencarian untuk "${val}" tidak ditemukan.`);
}

// Handler untuk input lacak tiket di Beranda (saat klik atau tekan Enter)
function handleQuickLookupTicket() {
  const input = document.getElementById('homeTicketInput');
  const err = document.getElementById('homeLookupError');
  const rawVal = input ? input.value.trim() : '';

  if (!rawVal) {
    if (err) {
      err.textContent = 'Silakan masukkan nomor tiket terlebih dahulu.';
      err.classList.remove('hidden');
    }
    if (input) input.focus();
    return;
  }

  const found = findTicketSmart(rawVal);
  if (found) {
    if (err) err.classList.add('hidden');
    populatePage2(found);
    switchPage('page2');
    showToast(`Nomor tiket ${found.nomor_tiket} ditemukan! Menampilkan status.`);
  } else {
    if (err) {
      err.textContent = `Nomor tiket "${rawVal}" tidak ditemukan dalam sistem. Pastikan format: ASP-XXXXXX.`;
      err.classList.remove('hidden');
    }
    showToast(`Tiket "${rawVal}" tidak ditemukan.`);
  }
}

function quickSelectCategoryAndReport(catName) {
  const select = document.getElementById('kategori');
  if (select) {
    select.value = catName;
  }
  switchPage('page1');
  showToast(`Kategori '${catName}' dipilih. Silakan lengkapi formulir.`);
  setTimeout(() => {
    const desc = document.getElementById('deskripsi');
    if (desc) desc.focus();
  }, 200);
}

/* =========================================================================
   2. VALIDASI & SUBMIT FORM ASPIRASI (PAGE 1 -> PAGE 2)
   ========================================================================= */
async function handleAspirationSubmit(e) {
  e.preventDefault();
  hideValidationError();

  const nomor_tiket = document.getElementById('nomor_tiket').value.trim();
  const nama_pelapor = document.getElementById('nama_pelapor').value.trim();
  const kategori = document.getElementById('kategori').value;
  const deskripsiInput = document.getElementById('deskripsi');
  const deskripsi = deskripsiInput.value.trim();

  /* =========================================================================
     VALIDASI BLACK BOX TC-01:
     Jika deskripsi kosong atau hanya spasi, munculkan error persis Penpot!
     ========================================================================= */
  if (!deskripsi) {
    showValidationError('Deskripsi wajib diisi - Berikan rincian laporan minimal keterangan singkat kendala.');
    deskripsiInput.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
    deskripsiInput.focus();
    return; // Hentikan penyimpanan
  }

  if (!nama_pelapor) {
    showValidationError('Nama pelapor wajib diisi.');
    document.getElementById('nama_pelapor').focus();
    return;
  }

  setSubmitLoading(true);

  const ticketPayload = {
    nomor_tiket,
    nama_pelapor,
    kategori,
    deskripsi,
    status: 'Pending'
  };

  let savedTicket = null;

  try {
    if (isCloudMode && supabaseClient) {
      // Jangan kirim "id" ke Supabase karena kolom "id" adalah GENERATED ALWAYS AS IDENTITY di PostgreSQL
      const { data, error } = await supabaseClient
        .from('tickets')
        .insert([ticketPayload])
        .select();

      if (error) throw error;
      savedTicket = (data && data.length) ? data[0] : { id: Date.now(), ...ticketPayload, created_at: new Date().toISOString() };
      ticketsState.unshift(savedTicket);
    } else {
      savedTicket = {
        id: Date.now(),
        ...ticketPayload,
        created_at: new Date().toISOString()
      };
      ticketsState.unshift(savedTicket);
      saveLocalStorage(ticketsState);
    }

    // Flag pengajuan baru agar header Page 2 menampilkan indikator sukses
    isRecentSubmission = true;

    // Simpan nomor tiket ke riwayat lokal agar dapat dilihat terus menerus
    saveMySubmittedTicketNumber(savedTicket.nomor_tiket);

    // Tampilkan data pada PAGE 2
    populatePage2(savedTicket);
    updateDashboardStats();

    // TRANSISI OTOMATIS DARI PAGE 1 KE PAGE 2!
    switchPage('page2');
    showToast('Aspirasi berhasil dikirim dan terdaftar!');

    // Bersihkan form
    document.getElementById('deskripsi').value = '';
    document.getElementById('charCount').textContent = '0 karakter';

    // Siapkan nomor baru untuk form selanjutnya
    setTimeout(generateNewTicketId, 500);
  } catch (err) {
    console.error('Gagal simpan tiket:', err);
    showValidationError('Terjadi kendala saat menyimpan: ' + err.message);
  } finally {
    setSubmitLoading(false);
  }
}

/* =========================================================================
   3. TOMBOL UJI CEPAT SKPL-06 (TC-01, TC-02, SEC-01 & RBAC)
   ========================================================================= */
function testTC01() {
  switchPage('page1');
  const desc = document.getElementById('deskripsi');
  if (desc) {
    desc.value = '';
    desc.focus();
    desc.classList.add('border-rose-400');
  }
  showValidationError('Deskripsi wajib diisi - Berikan rincian laporan minimal keterangan singkat kendala.');
}

function testTC02() {
  // Karena mahasiswa dibatasi RBAC, alihkan sementara ke role Admin untuk pengujian TC-02
  if (currentRole !== 'admin') {
    handleRoleSwitch('admin');
    showToast('Role otomatis dialihkan ke Admin untuk mendemokan update status (TC-02)!');
  }
  switchPage('page3');
  const item = ticketsState.find(t => t.status === 'Pending') || ticketsState[0];
  if (item) {
    selectTicketForPage3(item);
    const selectStatus = document.getElementById('p3SelectStatus');
    if (selectStatus) selectStatus.value = 'Diproses';
    handleUpdateStatusPage3();
  }
}

function testSEC01() {
  switchPage('page1');
  const pelapor = document.getElementById('nama_pelapor');
  const desc = document.getElementById('deskripsi');
  if (pelapor) pelapor.value = '<img src=x onerror=alert(1)>';
  if (desc) desc.value = '<img src="x" onerror="alert(\'Jebol XSS!\')">';
  hideValidationError();
  showToast('Payload XSS telah diisikan ke form. Klik "Kirim Aspirasi" untuk membuktikan ketahanan Anti-XSS!');
}

async function resetDataSimulasi() {
  if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data aspirasi menjadi 0?')) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('ASPIRASI_PENPOT_TICKETS_V1');
    localStorage.removeItem(MY_TICKETS_KEY);
    ticketsState = [];
    saveLocalStorage(ticketsState);

    if (isCloudMode && supabaseClient) {
      try {
        await supabaseClient.from('tickets').delete().neq('id', 0);
      } catch (e) {
        console.warn('Gagal reset di Supabase Cloud:', e);
      }
    }

    currentSelectedTicket = null;
    updateDashboardStats();
    if (document.getElementById('view-page3') && !document.getElementById('view-page3').classList.contains('hidden')) {
      renderPage3Table();
    }
    if (document.getElementById('view-page2') && !document.getElementById('view-page2').classList.contains('hidden')) {
      refreshPage2View();
    }
    showToast('Seluruh data aspirasi berhasil direset menjadi 0!');
  }
}

/* =========================================================================
   4. INISIALISASI APLIKASI
   ========================================================================= */
async function initSystem() {
  const statusBadge = document.getElementById('connectionStatusBadge');
  const statusText = document.getElementById('connectionStatusText');

  if (isCloudSupabaseConfigured() && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      isCloudMode = true;
      if (statusBadge) {
        statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
      if (statusText) {
        statusText.textContent = 'Cloud Supabase Active';
      }

      const { data } = await supabaseClient.from('tickets').select('*').order('created_at', { ascending: false });
      ticketsState = Array.isArray(data) ? data : loadStorage();
    } catch (err) {
      isCloudMode = false;
      ticketsState = loadStorage();
    }
  } else {
    isCloudMode = false;
    ticketsState = loadStorage();
  }

  // Generate Ticket ID awal
  generateNewTicketId();

  // Inisialisasi Status RBAC (Role-Based Access Control)
  applyRBAC();

  // Listeners
  const form = document.getElementById('aspirationForm');
  if (form) {
    form.addEventListener('submit', handleAspirationSubmit);
  }

  const pelaporInput = document.getElementById('nama_pelapor');
  if (pelaporInput) {
    pelaporInput.addEventListener('input', (e) => {
      if (currentRole === 'mahasiswa') {
        const nameVal = e.target.value.trim();
        const userName = document.getElementById('userNameDisplay');
        const userAvatar = document.getElementById('userAvatar');
        if (userName) userName.textContent = nameVal || 'Mahasiswa';
        if (userAvatar) {
          if (nameVal) {
            const initials = nameVal.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
            userAvatar.textContent = initials || 'M';
          } else {
            userAvatar.textContent = 'M';
          }
        }
      }
    });
  }

  const descInput = document.getElementById('deskripsi');
  if (descInput) {
    descInput.addEventListener('input', (e) => {
      const charCount = document.getElementById('charCount');
      if (charCount) charCount.textContent = `${e.target.value.length} karakter`;
      if (e.target.value.trim()) hideValidationError();
    });
  }

  // Hitung metrik ringkasan awal dashboard
  updateDashboardStats();

  // Default buka Halaman Beranda (Home / Dashboard)
  switchPage('home');
}

// Bootstrap saat DOM siap
document.addEventListener('DOMContentLoaded', initSystem);
