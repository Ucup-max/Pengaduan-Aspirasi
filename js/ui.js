/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - UI & PRESENTATION LAYER
   Separation of Concerns: DOM Manipulation, Views & Interface Interactions
   ========================================================================= */

/* =========================================================================
   1. TOAST NOTIFICATION PERSIS DESAIN PENPOT
   ========================================================================= */
function showToast(message) {
  const toast = document.getElementById('penpotToast');
  const toastMsg = document.getElementById('toastMessage');
  if (toastMsg) toastMsg.textContent = message;
  if (toast) toast.classList.remove('hidden');

  setTimeout(() => {
    if (toast) toast.classList.add('hidden');
  }, 3500);
}

function copyTicketNumber() {
  const displayEl = document.getElementById('displayTicketNumber');
  const ticketNum = displayEl ? displayEl.textContent.trim() : '';
  if (navigator.clipboard && ticketNum) {
    navigator.clipboard.writeText(ticketNum);
  }
  showToast(`Nomor tiket ${ticketNum} berhasil disalin ke clipboard!`);
}

/* =========================================================================
   2. INTERAKSI FAQ ACCORDION & MODAL BANTUAN
   ========================================================================= */
function toggleFaq(id) {
  const content = document.getElementById(`${id}-content`);
  const icon = document.getElementById(`${id}-icon`);
  if (!content) return;

  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    if (icon) icon.innerHTML = '&minus;';
  } else {
    content.classList.add('hidden');
    if (icon) icon.innerHTML = '&plus;';
  }
}

function openContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.remove('hidden');
}

function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.add('hidden');
}

function focusTicketTracker() {
  const input = document.getElementById('homeTicketInput');
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
  }
}

function handlePage2NextClick() {
  if (currentRole === 'dosen') {
    switchPage('page3');
  } else {
    switchPage('panduan');
  }
}

/* =========================================================================
   3. FORM VALIDATION & LOADING HELPERS
   ========================================================================= */
function showValidationError(message) {
  const errBox = document.getElementById('validationErrorBox');
  const errMsg = document.getElementById('validationErrorMessage');
  if (errMsg) errMsg.textContent = message;
  if (errBox) errBox.classList.remove('hidden');
}

function hideValidationError() {
  const errBox = document.getElementById('validationErrorBox');
  if (errBox) errBox.classList.add('hidden');

  const deskripsi = document.getElementById('deskripsi');
  if (deskripsi) {
    deskripsi.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
  }
}

function resetFormAspirasi() {
  const form = document.getElementById('aspirationForm');
  if (form) form.reset();
  generateNewTicketId();
  hideValidationError();
}

function setSubmitLoading(isLoading) {
  const btn = document.getElementById('btnSubmitAspirasi');
  const text = document.getElementById('btnSubmitText');
  const spinner = document.getElementById('submitSpinner');
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');
    if (spinner) spinner.classList.remove('hidden');
    if (text) text.textContent = 'Mengirim...';
  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'cursor-not-allowed');
    if (spinner) spinner.classList.add('hidden');
    if (text) text.textContent = 'Kirim Aspirasi →';
  }
}

/* =========================================================================
   4. SISTEM NAVIGASI INTERAKTIF MULTI-PAGE DENGAN ENFORCEMENT RBAC
   ========================================================================= */
function switchPage(pageId) {
  // PENEGAKAN KEAMANAN RBAC:
  // Mahasiswa HANYA BISA membuka home, page1 (Kirim Aspirasi), page2 (Nomor Tiket & Status), dan panduan (Panduan SOP)!
  // Halaman page3 (Antrean Aspirasi) HANYA DAPAT DIAKSES OLEH DOSEN (Akses Penuh)!
  if (pageId === 'page3' && currentRole !== 'dosen') {
    openAccessDeniedModal('Antrean Aspirasi');
    return; // Blokir akses
  }

  // Sembunyikan seluruh page view
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.add('hidden');
  });

  // Tampilkan page view yang dituju
  const targetView = document.getElementById(`view-${pageId}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Perbarui style aktif navigasi sidebar
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.className = 'nav-item w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer';
  });

  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) {
    activeNav.className = 'nav-item w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all bg-slate-900 text-white shadow-xs cursor-pointer';
  }

  // Update konten dinamis sesuai halaman yang dibuka
  if (pageId === 'home') {
    updateDashboardStats();
  } else if (pageId === 'page3') {
    renderPage3Table();
  } else if (pageId === 'page2') {
    const headerIcon = document.getElementById('page2HeaderIcon');
    const headerTitle = document.getElementById('page2HeaderTitle');
    const headerSubtitle = document.getElementById('page2HeaderSubtitle');

    if (isRecentSubmission) {
      if (headerIcon) {
        headerIcon.className = 'w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3 shadow-xs';
        headerIcon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
      }
      if (headerTitle) headerTitle.textContent = 'Aspirasi Berhasil Dikirim';
      if (headerSubtitle) headerSubtitle.textContent = 'Laporan Anda telah berhasil dicatat dalam antrean penanganan sistem.';
      isRecentSubmission = false;
    } else {
      if (headerIcon) {
        headerIcon.className = 'w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3 shadow-xs';
        headerIcon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
      }
      if (headerTitle) headerTitle.textContent = 'Nomor Tiket & Status Aspirasi';
      if (headerSubtitle) headerSubtitle.textContent = 'Pantau perkembangan dan tindak lanjut seluruh tiket aspirasi Anda tanpa tertimpa.';
    }

    refreshPage2View();
  }
}

/* =========================================================================
   5. DASHBOARD STATS VIEW
   ========================================================================= */
function updateDashboardStats() {
  const elTotal = document.getElementById('statTotalTickets');
  const elDiproses = document.getElementById('statDiprosesTickets');
  const elSelesai = document.getElementById('statSelesaiTickets');
  const listResolved = document.getElementById('homeRecentResolvedList');

  if (elTotal) elTotal.textContent = ticketsState.length;
  if (elDiproses) elDiproses.textContent = ticketsState.filter(t => t.status === 'Diproses').length;
  if (elSelesai) elSelesai.textContent = ticketsState.filter(t => t.status === 'Selesai').length;

  if (listResolved) {
    listResolved.innerHTML = '';
    const resolved = ticketsState.filter(t => t.status === 'Selesai').slice(0, 2);
    if (resolved.length === 0) {
      listResolved.innerHTML = `
        <div class="col-span-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400 text-center">
          Belum ada laporan yang diselesaikan baru-baru ini.
        </div>
      `;
    } else {
      resolved.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2 cursor-pointer hover:border-indigo-300 transition-all';
        
        const topDiv = document.createElement('div');
        topDiv.className = 'flex items-center justify-between';
        
        const badgeNomor = document.createElement('span');
        badgeNomor.className = 'font-mono font-bold text-xs text-indigo-700';
        badgeNomor.textContent = item.nomor_tiket;
        
        const badgeStatus = document.createElement('span');
        badgeStatus.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200';
        badgeStatus.textContent = 'Selesai';
        
        topDiv.appendChild(badgeNomor);
        topDiv.appendChild(badgeStatus);
        card.appendChild(topDiv);

        const katP = document.createElement('p');
        katP.className = 'text-xs text-slate-700 font-bold truncate';
        katP.textContent = item.kategori;
        card.appendChild(katP);

        const descP = document.createElement('p');
        descP.className = 'text-[11px] text-slate-500 line-clamp-2 leading-relaxed';
        descP.textContent = item.deskripsi;
        card.appendChild(descP);

        card.addEventListener('click', () => {
          populatePage2(item);
          switchPage('page2');
        });

        listResolved.appendChild(card);
      });
    }
  }
}

/* =========================================================================
   6. PAGE 2: STEPPER & MULTI-TICKET LIST VIEW
   ========================================================================= */
function updateStepperDisplay(status) {
  // Step 1: Pending
  const pendingBox = document.getElementById('step-pending-box');
  const pendingIcon = document.getElementById('step-pending-icon');
  const pendingTitle = document.getElementById('step-pending-title');
  const pendingBadge = document.getElementById('step-pending-badge');

  // Step 2: Diproses
  const diprosesBox = document.getElementById('step-diproses-box');
  const diprosesIcon = document.getElementById('step-diproses-icon');
  const diprosesTitle = document.getElementById('step-diproses-title');
  const diprosesBadge = document.getElementById('step-diproses-badge');

  // Step 3: Selesai
  const selesaiBox = document.getElementById('step-selesai-box');
  const selesaiIcon = document.getElementById('step-selesai-icon');
  const selesaiTitle = document.getElementById('step-selesai-title');
  const selesaiBadge = document.getElementById('step-selesai-badge');

  // Helper untuk membuat step inaktif menjadi warna abu-abu (persis Penpot)
  const setInactive = (box, icon, title, badge, badgeText) => {
    if (box) box.className = 'flex flex-col items-center opacity-30 transition-all duration-200';
    if (icon) icon.className = 'w-9 h-9 rounded-full bg-slate-100/80 text-slate-300 flex items-center justify-center mb-1.5 border border-slate-200/60 shadow-none';
    if (title) title.className = 'text-xs font-medium text-slate-400';
    if (badge) {
      badge.className = 'text-[10px] text-slate-300 mt-0.5';
      badge.textContent = badgeText;
    }
  };

  if (status === 'Pending') {
    // Step 1 AKTIF
    if (pendingBox) pendingBox.className = 'flex flex-col items-center opacity-100 transition-all duration-200';
    if (pendingIcon) pendingIcon.className = 'w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center mb-1.5 shadow-xs border-transparent';
    if (pendingTitle) pendingTitle.className = 'text-xs font-bold text-slate-900';
    if (pendingBadge) {
      pendingBadge.className = 'text-[10px] font-semibold text-amber-600 mt-0.5';
      pendingBadge.textContent = 'Tahap Aktif';
    }

    // Step 2 & 3 ABU-ABU
    setInactive(diprosesBox, diprosesIcon, diprosesTitle, diprosesBadge, 'Pemeriksaan');
    setInactive(selesaiBox, selesaiIcon, selesaiTitle, selesaiBadge, 'Tuntas');

  } else if (status === 'Diproses') {
    // Step 1 ABU-ABU
    setInactive(pendingBox, pendingIcon, pendingTitle, pendingBadge, 'Menunggu');

    // Step 2 AKTIF
    if (diprosesBox) diprosesBox.className = 'flex flex-col items-center opacity-100 transition-all duration-200';
    if (diprosesIcon) diprosesIcon.className = 'w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs border-transparent';
    if (diprosesTitle) diprosesTitle.className = 'text-xs font-bold text-slate-900';
    if (diprosesBadge) {
      diprosesBadge.className = 'text-[10px] font-semibold text-emerald-600 mt-0.5';
      diprosesBadge.textContent = 'Tahap Aktif';
    }

    // Step 3 ABU-ABU
    setInactive(selesaiBox, selesaiIcon, selesaiTitle, selesaiBadge, 'Tuntas');

  } else if (status === 'Selesai') {
    // Step 1 ABU-ABU
    setInactive(pendingBox, pendingIcon, pendingTitle, pendingBadge, 'Menunggu');

    // Step 2 ABU-ABU
    setInactive(diprosesBox, diprosesIcon, diprosesTitle, diprosesBadge, 'Pemeriksaan');

    // Step 3 AKTIF
    if (selesaiBox) selesaiBox.className = 'flex flex-col items-center opacity-100 transition-all duration-200';
    if (selesaiIcon) selesaiIcon.className = 'w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs border-transparent';
    if (selesaiTitle) selesaiTitle.className = 'text-xs font-bold text-slate-900';
    if (selesaiBadge) {
      selesaiBadge.className = 'text-[10px] font-semibold text-emerald-600 mt-0.5';
      selesaiBadge.textContent = 'Tuntas';
    }
  }
}

function renderPage2TicketList(selectedTicketNum) {
  const container = document.getElementById('page2MyTicketsList');
  if (!container) return;
  container.innerHTML = '';

  const myTickets = getMyTickets();
  const countBadge = document.getElementById('page2TicketCountBadge');
  if (countBadge) {
    countBadge.textContent = `${myTickets.length} Tiket`;
  }

  myTickets.forEach(ticket => {
    const isSelected = ticket.nomor_tiket === selectedTicketNum;

    // Kartu Tiket
    const card = document.createElement('div');
    card.className = isSelected
      ? 'relative p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer transition-all'
      : 'relative p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/60 shadow-2xs flex flex-col justify-between space-y-3 cursor-pointer transition-all group';

    // Klik kartu untuk memilih tiket dan melihat detailnya
    card.addEventListener('click', () => {
      populatePage2(ticket);
      // Scroll halus ke detail jika pada perangkat layar kecil / mobile
      if (window.innerWidth < 768) {
        const detailEl = document.getElementById('page2DetailContainer');
        if (detailEl) detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Baris Atas: Nomor Tiket & Status Badge
    const topRow = document.createElement('div');
    topRow.className = 'flex items-center justify-between gap-2';

    const nomorEl = document.createElement('span');
    nomorEl.className = isSelected 
      ? 'font-mono font-extrabold text-xs text-indigo-700 tracking-tight' 
      : 'font-mono font-bold text-xs text-slate-800 tracking-tight group-hover:text-indigo-600';
    nomorEl.textContent = ticket.nomor_tiket;

    const statusBadge = document.createElement('span');
    const st = ticket.status || 'Pending';
    if (st === 'Pending') {
      statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200';
      statusBadge.textContent = 'Pending';
    } else if (st === 'Diproses') {
      statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200';
      statusBadge.textContent = 'Diproses';
    } else {
      statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200';
      statusBadge.textContent = 'Selesai';
    }

    topRow.appendChild(nomorEl);
    topRow.appendChild(statusBadge);
    card.appendChild(topRow);

    // Bagian Tengah: Kategori & Ringkasan Deskripsi
    const middleDiv = document.createElement('div');
    middleDiv.className = 'space-y-1.5';

    const katBadge = document.createElement('span');
    katBadge.className = 'inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60';
    katBadge.textContent = ticket.kategori;

    const descEl = document.createElement('p');
    descEl.className = 'text-xs text-slate-600 line-clamp-2 leading-relaxed break-words font-normal';
    descEl.textContent = ticket.deskripsi;

    middleDiv.appendChild(katBadge);
    middleDiv.appendChild(descEl);
    card.appendChild(middleDiv);

    // Baris Bawah: Tanggal Pembuatan & Indikator Pilihan
    const bottomRow = document.createElement('div');
    bottomRow.className = 'flex items-center justify-between text-[11px] pt-2 border-t border-slate-100';

    const dateEl = document.createElement('span');
    dateEl.className = 'text-[10px] font-mono text-slate-400';
    const dateObj = new Date(ticket.created_at || Date.now());
    dateEl.textContent = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });

    const actionIndicator = document.createElement('span');
    if (isSelected) {
      actionIndicator.className = 'text-[10px] font-bold text-indigo-700 flex items-center gap-1';
      actionIndicator.innerHTML = '<span>Sedang Dilihat</span><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>';
    } else {
      actionIndicator.className = 'text-[10px] font-medium text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5';
      actionIndicator.innerHTML = '<span>Buka Detail</span><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
    }

    bottomRow.appendChild(dateEl);
    bottomRow.appendChild(actionIndicator);
    card.appendChild(bottomRow);

    container.appendChild(card);
  });
}

function populatePage2(ticket) {
  if (!ticket) return;
  currentSelectedTicket = ticket;

  // Simpan nomor tiket ke riwayat lokal agar selalu ada di daftar tiket mahasiswa
  saveMySubmittedTicketNumber(ticket.nomor_tiket);

  // Render ulang daftar kartu tiket dengan tiket ini dalam status terpilih (highlighted)
  renderPage2TicketList(ticket.nomor_tiket);

  // Pastikan container detail tampil & empty state tersembunyi
  const detailContainer = document.getElementById('page2DetailContainer');
  const emptyState = document.getElementById('page2EmptyTicketsState');
  if (detailContainer) detailContainer.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Nomor tiket
  const elNum = document.getElementById('displayTicketNumber');
  if (elNum) elNum.textContent = ticket.nomor_tiket;

  // Pelapor, kategori, deskripsi (MUTLAK ANTI-XSS DENGAN .textContent)
  const elNama = document.getElementById('displayNamaPelapor');
  if (elNama) elNama.textContent = ticket.nama_pelapor;

  const elKat = document.getElementById('displayKategori');
  if (elKat) elKat.textContent = ticket.kategori;

  const elDesk = document.getElementById('displayDeskripsi');
  if (elDesk) elDesk.textContent = ticket.deskripsi;

  // Format Waktu
  const dateObj = new Date(ticket.created_at || Date.now());
  const elDate = document.getElementById('displayCreatedDate');
  if (elDate) {
    elDate.textContent = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Update Stepper Progres Penanganan
  updateStepperDisplay(ticket.status);
}

function refreshPage2View() {
  const myTickets = getMyTickets();
  const countBadge = document.getElementById('page2TicketCountBadge');
  if (countBadge) {
    countBadge.textContent = `${myTickets.length} Tiket`;
  }

  const detailContainer = document.getElementById('page2DetailContainer');
  const emptyState = document.getElementById('page2EmptyTicketsState');

  if (myTickets.length === 0) {
    if (detailContainer) detailContainer.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    const listEl = document.getElementById('page2MyTicketsList');
    if (listEl) listEl.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (detailContainer) detailContainer.classList.remove('hidden');

  // Cari tiket aktif yang sedang terpilih
  let activeTicket = null;
  if (currentSelectedTicket) {
    activeTicket = myTickets.find(t => t.nomor_tiket === currentSelectedTicket.nomor_tiket);
  }
  if (!activeTicket) {
    activeTicket = myTickets[0];
  }

  populatePage2(activeTicket);
}

/* =========================================================================
   7. PAGE 3: TABEL ANTREAN & UPDATE STATUS (ADMIN)
   ========================================================================= */
function renderPage3Table() {
  const tbody = document.getElementById('p3TableBody');
  const filterEl = document.getElementById('p3FilterStatus');
  const filter = filterEl ? filterEl.value : 'Semua';
  const countBadge = document.getElementById('p3RecordBadge');

  if (!tbody) return;
  tbody.innerHTML = '';

  const searchInput = document.getElementById('p3SearchInput');
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = ticketsState.filter(t => {
    const matchStatus = (filter === 'Semua' || t.status === filter);
    const matchSearch = !searchVal ||
      (t.nomor_tiket && t.nomor_tiket.toLowerCase().includes(searchVal)) ||
      (t.nama_pelapor && t.nama_pelapor.toLowerCase().includes(searchVal)) ||
      (t.kategori && t.kategori.toLowerCase().includes(searchVal)) ||
      (t.deskripsi && t.deskripsi.toLowerCase().includes(searchVal));
    return matchStatus && matchSearch;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Tiket`;

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors cursor-pointer ' + 
      (currentSelectedTicket && currentSelectedTicket.id === item.id ? 'bg-indigo-50/50' : '');

    // 1. Nomor Tiket
    const tdNomor = document.createElement('td');
    tdNomor.className = 'px-4 py-3 font-mono font-bold text-slate-900';
    tdNomor.textContent = item.nomor_tiket;
    tr.appendChild(tdNomor);

    // 2. Waktu Laporan
    const tdWaktu = document.createElement('td');
    tdWaktu.className = 'px-4 py-3 text-slate-400 whitespace-nowrap text-[11px]';
    tdWaktu.textContent = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    tr.appendChild(tdWaktu);

    // 3. Kategori
    const tdKategori = document.createElement('td');
    tdKategori.className = 'px-4 py-3 text-slate-600 whitespace-nowrap';
    tdKategori.textContent = item.kategori;
    tr.appendChild(tdKategori);

    // 4. Rincian Aduan (MUTLAK ANTI-XSS DENGAN .textContent)
    const tdDeskripsi = document.createElement('td');
    tdDeskripsi.className = 'px-4 py-3 text-slate-700 truncate max-w-xs';
    tdDeskripsi.textContent = item.deskripsi;
    tr.appendChild(tdDeskripsi);

    // 5. Status
    const tdStatus = document.createElement('td');
    tdStatus.className = 'px-4 py-3 text-center';
    const badge = document.createElement('span');
    if (item.status === 'Pending') {
      badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200';
    } else if (item.status === 'Diproses') {
      badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200';
    } else {
      badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    badge.textContent = item.status;
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    // Event Klik Baris untuk Memilih Tiket
    tr.addEventListener('click', () => {
      selectTicketForPage3(item);
    });

    tbody.appendChild(tr);
  });

  // Default pilih tiket pertama jika belum ada yang terpilih
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-slate-400 text-xs">
          Belum ada data aspirasi pada sistem.
        </td>
      </tr>
    `;
    selectTicketForPage3(null);
  } else if (!currentSelectedTicket && filtered.length > 0) {
    selectTicketForPage3(filtered[0]);
  }
}

function selectTicketForPage3(ticket) {
  currentSelectedTicket = ticket;
  const badge = document.getElementById('p3DetailStatusBadge');
  if (!ticket) {
    const elNomor = document.getElementById('p3DetailNomor');
    const elPelapor = document.getElementById('p3DetailPelapor');
    const elKat = document.getElementById('p3DetailKategori');
    const elDesk = document.getElementById('p3DetailDeskripsi');
    const elStatus = document.getElementById('p3SelectStatus');

    if (elNomor) elNomor.textContent = '-';
    if (elPelapor) elPelapor.textContent = '-';
    if (elKat) elKat.textContent = '-';
    if (elDesk) elDesk.textContent = 'Belum ada data aspirasi yang dipilih.';
    if (elStatus) elStatus.value = 'Pending';
    if (badge) {
      badge.textContent = '-';
      badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200';
    }
    return;
  }

  document.getElementById('p3DetailNomor').textContent = ticket.nomor_tiket;
  document.getElementById('p3DetailPelapor').textContent = ticket.nama_pelapor;
  document.getElementById('p3DetailKategori').textContent = ticket.kategori;
  document.getElementById('p3DetailDeskripsi').textContent = ticket.deskripsi;
  document.getElementById('p3SelectStatus').value = ticket.status;

  badge.textContent = ticket.status;
  if (ticket.status === 'Pending') {
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200';
  } else if (ticket.status === 'Diproses') {
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200';
  } else {
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
}

// UPDATE STATUS TIKET (TC-02)
async function handleUpdateStatusPage3() {
  if (!currentSelectedTicket) return;

  const newStatus = document.getElementById('p3SelectStatus').value;
  const index = ticketsState.findIndex(t => t.id === currentSelectedTicket.id);

  if (index !== -1) {
    ticketsState[index].status = newStatus;
    currentSelectedTicket = ticketsState[index];

    if (isCloudMode && supabaseClient) {
      await supabaseClient
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', currentSelectedTicket.id);
    } else {
      saveLocalStorage(ticketsState);
    }

    renderPage3Table();
    selectTicketForPage3(currentSelectedTicket);
    updateDashboardStats();
    showToast(`Status tiket ${currentSelectedTicket.nomor_tiket} diperbarui menjadi '${newStatus}'!`);
  }
}
