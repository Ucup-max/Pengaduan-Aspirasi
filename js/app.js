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

    if (tNum === q) return true;
    if (tNumClean === qClean) return true;
    if (qClean.length >= 3 && tNumClean.includes(qClean)) return true;
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
    switchPage('page2', { id: found.nomor_tiket });
    showToast(`Tiket ${found.nomor_tiket} ditemukan! Menampilkan status.`);
    return;
  }

  // 2. Cari berdasarkan kata kunci
  const foundKeyword = ticketsState.find(t =>
    (t.nama_pelapor && t.nama_pelapor.toLowerCase().includes(val.toLowerCase())) ||
    (t.nama_asli && t.nama_asli.toLowerCase().includes(val.toLowerCase())) ||
    (t.lokasi && t.lokasi.toLowerCase().includes(val.toLowerCase())) ||
    (t.deskripsi && t.deskripsi.toLowerCase().includes(val.toLowerCase())) ||
    (t.kategori && t.kategori.toLowerCase().includes(val.toLowerCase()))
  );

  if (foundKeyword) {
    populatePage2(foundKeyword);
    switchPage('page2', { id: foundKeyword.nomor_tiket });
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
    switchPage('page2', { id: found.nomor_tiket });
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
  switchPage('page1', { kategori: catName });
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
  const lokasiInput = document.getElementById('lokasi');
  const lokasi = lokasiInput ? lokasiInput.value.trim() : '';
  const deskripsiInput = document.getElementById('deskripsi');
  const deskripsi = deskripsiInput.value.trim();
  const isAnonim = document.getElementById('is_anonim') ? document.getElementById('is_anonim').checked : false;

  // Validasi Nama Pelapor
  if (!nama_pelapor) {
    showValidationError('Nama pelapor wajib diisi.');
    document.getElementById('nama_pelapor').focus();
    return;
  }

  // Validasi Lokasi Spesifik
  if (!lokasi || lokasi.length < 3) {
    showValidationError('Lokasi spesifik wajib diisi (contoh: Gedung F, Lantai 2, Ruang F2.01) agar memudahkan teknisi.');
    if (lokasiInput) {
      lokasiInput.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
      lokasiInput.focus();
    }
    return;
  }

  // Validasi Minimal 20 Karakter pada Deskripsi Aspirasi (TC-01 Upgrade)
  if (!deskripsi) {
    showValidationError('Deskripsi wajib diisi - Berikan rincian laporan minimal 20 karakter.');
    deskripsiInput.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
    deskripsiInput.focus();
    return;
  }

  if (deskripsi.length < 20) {
    showValidationError(`Deskripsi minimal 20 karakter agar kendala dapat dipahami dengan jelas (saat ini: ${deskripsi.length} karakter).`);
    deskripsiInput.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
    deskripsiInput.focus();
    return;
  }

  setSubmitLoading(true);

  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const pelaporId = currentUser ? (currentUser.nim || currentUser.username) : '';

  const ticketPayload = {
    nomor_tiket,
    nama_pelapor: isAnonim ? 'Sivitas Akademika (Anonim)' : nama_pelapor,
    nama_asli: nama_pelapor,
    pelapor_id: pelaporId,
    is_anonim: isAnonim,
    kategori,
    lokasi,
    deskripsi,
    lampiran_foto: currentAttachmentBase64 || null,
    status: 'Pending',
    catatan_penanganan: '',
    riwayat: [
      {
        status: 'Pending',
        waktu: new Date().toISOString(),
        catatan: 'Aspirasi resmi diajukan dan masuk ke antrean helpdesk.',
        petugas: 'Sistem'
      }
    ],
    konfirmasi_selesai: false,
    rating: null,
    feedback: ''
  };

  let savedTicket = null;

  try {
    if (isCloudMode && supabaseClient) {
      const supabasePayload = {
        nomor_tiket: ticketPayload.nomor_tiket,
        nama_pelapor: ticketPayload.nama_pelapor,
        kategori: ticketPayload.kategori,
        deskripsi: `[Lokasi: ${lokasi}]\n\n${deskripsi}`,
        status: 'Pending'
      };

      const { data, error } = await supabaseClient
        .from('tickets')
        .insert([supabasePayload])
        .select();

      if (error) throw error;
      savedTicket = (data && data.length)
        ? { ...ticketPayload, id: data[0].id, created_at: data[0].created_at }
        : { id: Date.now(), ...ticketPayload, created_at: new Date().toISOString() };
      ticketsState.unshift(savedTicket);
      saveLocalStorage(ticketsState);
    } else {
      savedTicket = {
        id: Date.now(),
        ...ticketPayload,
        created_at: new Date().toISOString()
      };
      ticketsState.unshift(savedTicket);
      saveLocalStorage(ticketsState);
    }

    isRecentSubmission = true;
    saveMySubmittedTicketNumber(savedTicket.nomor_tiket);

    // Tampilkan data pada PAGE 2
    populatePage2(savedTicket);
    updateDashboardStats();

    // TRANSISI SINKRON DENGAN ROUTING HASH
    switchPage('page2', { id: savedTicket.nomor_tiket });
    showToast('Aspirasi berhasil dikirim dan terdaftar!');

    // Bersihkan formulir
    document.getElementById('deskripsi').value = '';
    if (lokasiInput) lokasiInput.value = '';
    removeLampiranFoto();
    const isAnonCheck = document.getElementById('is_anonim');
    if (isAnonCheck) isAnonCheck.checked = false;

    const charCount = document.getElementById('charCount');
    if (charCount) charCount.innerHTML = '0 / min. 20 karakter';

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
    desc.value = 'AC bocor';
    desc.focus();
    desc.classList.add('border-rose-400');
  }
  showValidationError('Deskripsi minimal 20 karakter agar kendala dapat dipahami dengan jelas (saat ini: 8 karakter).');
}

function testTC02() {
  if (currentRole !== 'dosen') {
    executeRoleSwitch('dosen');
    showToast('Role otomatis dialihkan ke Dosen untuk mendemokan update status (TC-02)!');
  }
  switchPage('page3');
  const item = ticketsState.find(t => t.status === 'Pending') || ticketsState[0];
  if (item) {
    selectTicketForPage3(item);
    const selectStatus = document.getElementById('p3SelectStatus');
    if (selectStatus) selectStatus.value = 'Diproses';
    const catatan = document.getElementById('p3CatatanPenanganan');
    if (catatan) catatan.value = 'Teknisi dijadwalkan memeriksa lokasi dalam 2 jam kerja.';
    handleUpdateStatusPage3();
  }
}

function testSEC01() {
  switchPage('page1');
  const pelapor = document.getElementById('nama_pelapor');
  const desc = document.getElementById('deskripsi');
  const lok = document.getElementById('lokasi');
  if (pelapor) pelapor.value = '<img src=x onerror=alert(1)>';
  if (lok) lok.value = '<script>alert("XSS")</script> Gedung F2';
  if (desc) desc.value = '<img src="x" onerror="alert(\'Jebol XSS!\')"> Kerusakan kabel proyektor lab komputer 3 tidak muncul gambar.';
  hideValidationError();
  showToast('Payload XSS telah diisikan ke form. Klik "Kirim Aspirasi" untuk membuktikan ketahanan Anti-XSS!');
}

async function resetDataSimulasi() {
  if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data aspirasi menjadi 0?')) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    showToast('Seluruh data aspirasi berhasil direset!');
  }
}

/* =========================================================================
   4. INISIALISASI APLIKASI & URL HASH ROUTING BOOTSTRAP
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
      ticketsState = Array.isArray(data) && data.length > 0 ? data.map(sanitizeTicketObject) : loadStorage();
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

  // Inisialisasi Listener Formulir Aspirasi
  const form = document.getElementById('aspirationForm');
  if (form) {
    form.addEventListener('submit', handleAspirationSubmit);
  }

  // Live Character Counter & Validation Clear
  const descInput = document.getElementById('deskripsi');
  if (descInput) {
    descInput.addEventListener('input', (e) => {
      const len = e.target.value.length;
      const charCount = document.getElementById('charCount');
      if (charCount) {
        if (len < 20) {
          charCount.innerHTML = `<span class="text-rose-500 font-bold">${len}</span> / min. 20 karakter`;
        } else {
          charCount.innerHTML = `<span class="text-emerald-600 font-bold">${len} karakter</span> <span class="text-emerald-600 font-semibold">(Memenuhi syarat)</span>`;
        }
      }
      if (e.target.value.trim().length >= 20) hideValidationError();
    });
  }

  const lokasiInput = document.getElementById('lokasi');
  if (lokasiInput) {
    lokasiInput.addEventListener('input', () => {
      if (lokasiInput.value.trim().length >= 3) hideValidationError();
    });
  }

  // Pasang Listener URL Hash Routing
  window.addEventListener('hashchange', handleHashRouting);

  // Setup Awal Sesuai Sesi Pengguna
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user) {
    currentRole = user.role || 'mahasiswa';
    applyUserProfile(user);
    applyRBAC();
    updateDashboardStats();
    handleHashRouting();
  } else {
    handleHashRouting();
  }
}

// Bootstrap saat DOM siap
document.addEventListener('DOMContentLoaded', initSystem);
