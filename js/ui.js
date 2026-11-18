/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - UI & PRESENTATION LAYER
   Separation of Concerns: DOM Manipulation, Views & Interface Interactions
   ========================================================================= */

/* =========================================================================
   1. TOAST NOTIFICATION & CLIPBOARD COPY
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

function copyTicketNumber(explicitNum) {
  let ticketNum = explicitNum;
  if (!ticketNum) {
    const displayEl = document.getElementById('displayTicketNumber');
    ticketNum = displayEl ? displayEl.textContent.trim() : '';
  }
  if (!ticketNum && currentSelectedTicket) {
    ticketNum = currentSelectedTicket.nomor_tiket;
  }

  if (ticketNum) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ticketNum)
        .then(() => showToast('Nomor tiket berhasil disalin'))
        .catch(() => {
          fallbackCopyText(ticketNum);
          showToast('Nomor tiket berhasil disalin');
        });
    } else {
      fallbackCopyText(ticketNum);
      showToast('Nomor tiket berhasil disalin');
    }
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.warn('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
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

function openLoginHelpModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.remove('hidden');
}

function closeLoginHelpModal() {
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
   3. LAMPIRAN FOTO BUKTI & IMAGE VIEWER LIGHTBOX
   ========================================================================= */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function handleFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Format file tidak didukung! Gunakan gambar JPG, PNG, atau WebP.');
    e.target.value = '';
    return;
  }

  const maxBytes = 3 * 1024 * 1024; // 3MB
  if (file.size > maxBytes) {
    showToast('Ukuran file foto melebihi 3MB! Harap pilih gambar lebih kecil.');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    currentAttachmentBase64 = evt.target.result;
    const previewContainer = document.getElementById('fotoPreviewContainer');
    const previewImg = document.getElementById('fotoPreviewImg');
    const previewName = document.getElementById('fotoPreviewName');
    const previewSize = document.getElementById('fotoPreviewSize');
    const dropzone = document.getElementById('fotoDropzone');

    if (previewImg) previewImg.src = currentAttachmentBase64;
    if (previewName) previewName.textContent = file.name;
    if (previewSize) previewSize.textContent = formatBytes(file.size);
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (dropzone) dropzone.classList.add('hidden');
    showToast('Foto bukti berhasil diunggah.');
  };
  reader.readAsDataURL(file);
}

function removeLampiranFoto() {
  currentAttachmentBase64 = null;
  const input = document.getElementById('lampiran_foto');
  if (input) input.value = '';
  const previewContainer = document.getElementById('fotoPreviewContainer');
  const dropzone = document.getElementById('fotoDropzone');
  if (previewContainer) previewContainer.classList.add('hidden');
  if (dropzone) dropzone.classList.remove('hidden');
  showToast('Lampiran foto dihapus.');
}

function openImageViewerModal(imgSrc) {
  const modal = document.getElementById('imageViewerModal');
  const img = document.getElementById('imageViewerImg');
  if (modal && img) {
    img.src = imgSrc;
    modal.classList.remove('hidden');
  }
}

function closeImageViewerModal() {
  const modal = document.getElementById('imageViewerModal');
  if (modal) modal.classList.add('hidden');
}

/* =========================================================================
   4. FORM VALIDATION & LOADING HELPERS
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
  const lokasi = document.getElementById('lokasi');
  if (lokasi) {
    lokasi.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
  }
}

function resetFormAspirasi() {
  const form = document.getElementById('aspirationForm');
  if (form) form.reset();
  removeLampiranFoto();
  generateNewTicketId();
  hideValidationError();
  const counterEl = document.getElementById('charCount');
  if (counterEl) counterEl.innerHTML = '0 / min. 20 karakter';
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
   5. CLIENT-SIDE ROUTING & NAVIGATION (URL HASH SINKRONISASI)
   ========================================================================= */
function switchPage(pageId, queryParams = null) {
  const routeMap = {
    'home': 'beranda',
    'page1': 'lapor',
    'page2': 'tiket',
    'page3': 'petugas',
    'panduan': 'panduan'
  };
  const route = routeMap[pageId] || pageId;
  let targetHash = `#/${route}`;
  if (queryParams && typeof queryParams === 'object') {
    const q = new URLSearchParams(queryParams).toString();
    if (q) targetHash += `?${q}`;
  }

  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    handleHashRouting();
  }
}

function handleHashRouting() {
  const hash = window.location.hash || '#/login';
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

  let cleanHash = hash.replace(/^#\/?/, '');
  let [routePart, queryPart] = cleanHash.split('?');
  routePart = (routePart || '').toLowerCase().trim();

  let routeParam = null;
  if (routePart.includes('/')) {
    const parts = routePart.split('/');
    routePart = parts[0];
    routeParam = parts[1];
  }

  const queryParams = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
  }
  if (routeParam && !queryParams.id) {
    queryParams.id = routeParam;
  }

  // Gerbang Autentikasi
  if (!user) {
    if (routePart !== 'login') {
      window.location.hash = '#/login';
      return;
    }
    showLoginView();
    return;
  }

  // Jika sudah login dan membuka #/login atau hash kosong, redirect ke #/beranda
  if (routePart === 'login' || routePart === '') {
    window.location.hash = '#/beranda';
    return;
  }

  showDashboardLayout();

  // Enforce RBAC untuk Portal Petugas / Antrean
  if (routePart === 'petugas' || routePart === 'antrean' || routePart === 'page3') {
    if (currentRole !== 'dosen') {
      openAccessDeniedModal('Antrean Aspirasi');
      window.location.hash = '#/beranda';
      return;
    }
    renderRoute('page3', queryParams);
    return;
  }

  switch (routePart) {
    case 'beranda':
    case 'home':
      renderRoute('home', queryParams);
      break;
    case 'lapor':
    case 'page1':
      renderRoute('page1', queryParams);
      break;
    case 'tiket':
    case 'page2':
      renderRoute('page2', queryParams);
      break;
    case 'panduan':
      renderRoute('panduan', queryParams);
      break;
    default:
      renderRoute('home', queryParams);
      break;
  }
}

function showLoginView() {
  const appLayout = document.getElementById('appLayoutWrapper');
  const loginView = document.getElementById('view-login');
  if (appLayout) appLayout.classList.add('hidden');
  if (loginView) {
    loginView.classList.remove('hidden');
    loginView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function showDashboardLayout() {
  const appLayout = document.getElementById('appLayoutWrapper');
  const loginView = document.getElementById('view-login');
  if (loginView) loginView.classList.add('hidden');
  if (appLayout) appLayout.classList.remove('hidden');
}

function renderRoute(pageId, queryParams = {}) {
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

  // Aksi khusus sesuai tampilan aktif
  if (pageId === 'home') {
    updateDashboardStats();
  } else if (pageId === 'page1') {
    if (queryParams && queryParams.kategori) {
      const select = document.getElementById('kategori');
      if (select) {
        select.value = queryParams.kategori;
      }
      showToast(`Kategori '${queryParams.kategori}' dipilih.`);
      setTimeout(() => {
        const lok = document.getElementById('lokasi');
        if (lok) lok.focus();
      }, 150);
    }
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

    if (queryParams && queryParams.id) {
      const found = typeof findTicketSmart === 'function' ? findTicketSmart(queryParams.id) : null;
      if (found) {
        populatePage2(found);
        return;
      }
    }
    refreshPage2View();
  }
}

/* =========================================================================
   6. DASHBOARD STATS VIEW
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
          switchPage('page2', { id: item.nomor_tiket });
        });

        listResolved.appendChild(card);
      });
    }
  }
}

/* =========================================================================
   7. PAGE 2: STEPPER & MULTI-TICKET LIST VIEW
   ========================================================================= */
function updateStepperDisplay(status) {
  const pendingBox = document.getElementById('step-pending-box');
  const pendingIcon = document.getElementById('step-pending-icon');
  const pendingTitle = document.getElementById('step-pending-title');
  const pendingBadge = document.getElementById('step-pending-badge');

  const diprosesBox = document.getElementById('step-diproses-box');
  const diprosesIcon = document.getElementById('step-diproses-icon');
  const diprosesTitle = document.getElementById('step-diproses-title');
  const diprosesBadge = document.getElementById('step-diproses-badge');

  const selesaiBox = document.getElementById('step-selesai-box');
  const selesaiIcon = document.getElementById('step-selesai-icon');
  const selesaiTitle = document.getElementById('step-selesai-title');
  const selesaiBadge = document.getElementById('step-selesai-badge');

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
    if (pendingBox) pendingBox.className = 'flex flex-col items-center opacity-100 transition-all duration-200';
    if (pendingIcon) pendingIcon.className = 'w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center mb-1.5 shadow-xs border-transparent';
    if (pendingTitle) pendingTitle.className = 'text-xs font-bold text-slate-900';
    if (pendingBadge) {
      pendingBadge.className = 'text-[10px] font-semibold text-amber-600 mt-0.5';
      pendingBadge.textContent = 'Tahap Aktif';
    }
    setInactive(diprosesBox, diprosesIcon, diprosesTitle, diprosesBadge, 'Pemeriksaan');
    setInactive(selesaiBox, selesaiIcon, selesaiTitle, selesaiBadge, 'Tuntas');

  } else if (status === 'Diproses') {
    setInactive(pendingBox, pendingIcon, pendingTitle, pendingBadge, 'Menunggu');

    if (diprosesBox) diprosesBox.className = 'flex flex-col items-center opacity-100 transition-all duration-200';
    if (diprosesIcon) diprosesIcon.className = 'w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs border-transparent';
    if (diprosesTitle) diprosesTitle.className = 'text-xs font-bold text-slate-900';
    if (diprosesBadge) {
      diprosesBadge.className = 'text-[10px] font-semibold text-emerald-600 mt-0.5';
      diprosesBadge.textContent = 'Tahap Aktif';
    }

    setInactive(selesaiBox, selesaiIcon, selesaiTitle, selesaiBadge, 'Tuntas');

  } else if (status === 'Selesai') {
    setInactive(pendingBox, pendingIcon, pendingTitle, pendingBadge, 'Menunggu');
    setInactive(diprosesBox, diprosesIcon, diprosesTitle, diprosesBadge, 'Pemeriksaan');

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

    const card = document.createElement('div');
    card.className = isSelected
      ? 'relative p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer transition-all'
      : 'relative p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/60 shadow-2xs flex flex-col justify-between space-y-3 cursor-pointer transition-all group';

    card.addEventListener('click', () => {
      populatePage2(ticket);
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

    // Tengah: Kategori & Ringkasan Deskripsi
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

    // Bawah: Tanggal Pembuatan & Indikator Pilihan
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

function renderTicketTimeline(ticket) {
  const container = document.getElementById('page2TimelineList');
  const countBadge = document.getElementById('timelineCountBadge');
  if (!container) return;

  container.innerHTML = '';
  const riwayat = Array.isArray(ticket.riwayat) && ticket.riwayat.length > 0
    ? ticket.riwayat
    : [
        {
          status: ticket.status || 'Pending',
          waktu: ticket.created_at || new Date().toISOString(),
          catatan: ticket.catatan_penanganan || 'Laporan tercatat di sistem.',
          petugas: 'Sistem'
        }
      ];

  if (countBadge) {
    countBadge.textContent = `${riwayat.length} Riwayat`;
  }

  riwayat.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'relative flex items-start gap-3 group';

    // Dot indicator
    const dot = document.createElement('div');
    let dotColor = 'bg-amber-500 ring-4 ring-amber-100';
    let statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    if (item.status === 'Diproses') {
      dotColor = 'bg-sky-500 ring-4 ring-sky-100';
      statusBadgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (item.status === 'Selesai') {
      dotColor = 'bg-emerald-500 ring-4 ring-emerald-100';
      statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    dot.className = `w-3.5 h-3.5 rounded-full ${dotColor} shrink-0 mt-0.5 z-10 transition-transform group-hover:scale-125`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 space-y-1';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex flex-wrap items-center justify-between gap-1.5';

    const badge = document.createElement('span');
    badge.className = `text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeColor}`;
    badge.textContent = item.status;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-[10px] font-mono text-slate-400';
    const dateObj = new Date(item.waktu || Date.now());
    timeSpan.textContent = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';

    headerDiv.appendChild(badge);
    headerDiv.appendChild(timeSpan);
    contentDiv.appendChild(headerDiv);

    if (item.petugas) {
      const actorP = document.createElement('p');
      actorP.className = 'text-[11px] font-bold text-slate-700';
      actorP.textContent = `Pembaruan oleh: ${item.petugas}`;
      contentDiv.appendChild(actorP);
    }

    if (item.catatan) {
      const noteBox = document.createElement('div');
      noteBox.className = 'text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal';
      noteBox.textContent = item.catatan;
      contentDiv.appendChild(noteBox);
    }

    itemDiv.appendChild(dot);
    itemDiv.appendChild(contentDiv);
    container.appendChild(itemDiv);
  });
}

function updatePage2ReporterActions(ticket) {
  const actionContainer = document.getElementById('page2ReporterActionsContainer');
  if (!actionContainer) return;

  if (ticket.status === 'Selesai') {
    actionContainer.classList.remove('hidden');

    const confirmedBox = document.getElementById('page2ConfirmedBox');
    const actionButtonsBox = document.getElementById('page2ActionButtonsBox');
    const ratingDisplay = document.getElementById('page2RatingDisplay');
    const feedbackDisplay = document.getElementById('page2FeedbackDisplay');

    if (ticket.konfirmasi_selesai) {
      if (confirmedBox) confirmedBox.classList.remove('hidden');
      if (actionButtonsBox) actionButtonsBox.classList.add('hidden');

      if (ratingDisplay) {
        const stars = '★'.repeat(ticket.rating || 5) + '☆'.repeat(5 - (ticket.rating || 5));
        ratingDisplay.textContent = `${stars} (${ticket.rating || 5}/5)`;
      }
      if (feedbackDisplay) {
        feedbackDisplay.textContent = ticket.feedback ? `"${ticket.feedback}"` : 'Kendala telah tuntas diselesaikan dengan baik.';
      }
    } else {
      if (confirmedBox) confirmedBox.classList.add('hidden');
      if (actionButtonsBox) actionButtonsBox.classList.remove('hidden');
    }
  } else {
    actionContainer.classList.add('hidden');
  }
}

function populatePage2(ticket) {
  if (!ticket) return;
  currentSelectedTicket = ticket;

  saveMySubmittedTicketNumber(ticket.nomor_tiket);
  renderPage2TicketList(ticket.nomor_tiket);

  const detailContainer = document.getElementById('page2DetailContainer');
  const emptyState = document.getElementById('page2EmptyTicketsState');
  if (detailContainer) detailContainer.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Nomor tiket
  const elNum = document.getElementById('displayTicketNumber');
  if (elNum) elNum.textContent = ticket.nomor_tiket;

  // Pelapor
  const elNama = document.getElementById('displayNamaPelapor');
  if (elNama) {
    if (ticket.is_anonim) {
      elNama.innerHTML = '<span class="text-slate-700 font-bold">Sivitas Akademika (Anonim)</span> <span class="text-[10px] font-normal text-slate-400 font-mono">(Privasi Terlindungi)</span>';
    } else {
      elNama.textContent = ticket.nama_pelapor;
    }
  }

  // Lokasi Spesifik
  const elLokasi = document.getElementById('displayLokasi');
  if (elLokasi) elLokasi.textContent = ticket.lokasi || 'Lingkungan Kampus';

  // Kategori & Deskripsi
  const elKat = document.getElementById('displayKategori');
  if (elKat) elKat.textContent = ticket.kategori;

  const elDesk = document.getElementById('displayDeskripsi');
  if (elDesk) elDesk.textContent = ticket.deskripsi;

  // Lampiran Foto Bukti
  const fotoContainer = document.getElementById('displayFotoContainer');
  const fotoImg = document.getElementById('displayFotoBukti');
  if (fotoContainer && fotoImg) {
    if (ticket.lampiran_foto) {
      fotoImg.src = ticket.lampiran_foto;
      fotoContainer.classList.remove('hidden');
    } else {
      fotoContainer.classList.add('hidden');
    }
  }

  // Waktu
  const dateObj = new Date(ticket.created_at || Date.now());
  const elDate = document.getElementById('displayCreatedDate');
  if (elDate) {
    elDate.textContent = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  }

  // Stepper & Timeline
  updateStepperDisplay(ticket.status);
  renderTicketTimeline(ticket);
  updatePage2ReporterActions(ticket);
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
   8. AKSI PELAPOR PADA STATUS SELESAI (KONFIRMASI & BUKA KEMBALI)
   ========================================================================= */
let currentRatingValue = 5;

function openConfirmResolveModal() {
  const modal = document.getElementById('confirmResolveModal');
  if (modal) {
    setRatingStars(5);
    const feedback = document.getElementById('confirmFeedbackInput');
    if (feedback) feedback.value = '';
    modal.classList.remove('hidden');
  }
}

function closeConfirmResolveModal() {
  const modal = document.getElementById('confirmResolveModal');
  if (modal) modal.classList.add('hidden');
}

function setRatingStars(starCount) {
  currentRatingValue = starCount;
  for (let i = 1; i <= 5; i++) {
    const starBtn = document.getElementById(`starBtn-${i}`);
    if (starBtn) {
      if (i <= starCount) {
        starBtn.className = 'text-amber-400 hover:scale-110 transition-transform cursor-pointer text-2xl';
      } else {
        starBtn.className = 'text-slate-300 hover:scale-110 transition-transform cursor-pointer text-2xl';
      }
    }
  }
  const label = document.getElementById('ratingLabelText');
  const labels = ['', 'Sangat Kurang', 'Kurang Memuaskan', 'Cukup Baik', 'Memuaskan', 'Sangat Memuaskan!'];
  if (label) label.textContent = `${starCount} Bintang • ${labels[starCount] || ''}`;
}

async function submitConfirmResolve() {
  if (!currentSelectedTicket) return;
  const feedbackInput = document.getElementById('confirmFeedbackInput');
  const feedbackText = feedbackInput ? feedbackInput.value.trim() : '';

  const index = ticketsState.findIndex(t => t.id === currentSelectedTicket.id);
  if (index !== -1) {
    ticketsState[index].konfirmasi_selesai = true;
    ticketsState[index].rating = currentRatingValue;
    ticketsState[index].feedback = feedbackText;

    ticketsState[index].riwayat = ticketsState[index].riwayat || [];
    ticketsState[index].riwayat.push({
      status: 'Selesai',
      waktu: new Date().toISOString(),
      catatan: `Pelapor mengonfirmasi penanganan tuntas (${currentRatingValue}/5 Bintang). ${feedbackText ? `Ulasan: "${feedbackText}"` : ''}`,
      petugas: 'Pelapor (Konfirmasi Tuntas)'
    });

    currentSelectedTicket = ticketsState[index];
    saveLocalStorage(ticketsState);

    if (isCloudMode && supabaseClient) {
      try {
        await supabaseClient
          .from('tickets')
          .update({ status: 'Selesai' })
          .eq('id', currentSelectedTicket.id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }

    closeConfirmResolveModal();
    populatePage2(currentSelectedTicket);
    updateDashboardStats();
    showToast('Terima kasih! Konfirmasi tuntas dan rating berhasil disimpan.');
  }
}

function openReopenTicketModal() {
  const modal = document.getElementById('reopenTicketModal');
  const reasonInput = document.getElementById('reopenReasonInput');
  const errorEl = document.getElementById('reopenErrorText');
  if (reasonInput) reasonInput.value = '';
  if (errorEl) errorEl.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
}

function closeReopenTicketModal() {
  const modal = document.getElementById('reopenTicketModal');
  if (modal) modal.classList.add('hidden');
}

async function submitReopenTicket() {
  if (!currentSelectedTicket) return;
  const reasonInput = document.getElementById('reopenReasonInput');
  const errorEl = document.getElementById('reopenErrorText');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!reason) {
    if (errorEl) {
      errorEl.textContent = 'Harap tuliskan alasan kendala belum terselesaikan.';
      errorEl.classList.remove('hidden');
    }
    if (reasonInput) reasonInput.focus();
    return;
  }

  const index = ticketsState.findIndex(t => t.id === currentSelectedTicket.id);
  if (index !== -1) {
    ticketsState[index].status = 'Diproses';
    ticketsState[index].konfirmasi_selesai = false;
    ticketsState[index].riwayat = ticketsState[index].riwayat || [];
    ticketsState[index].riwayat.push({
      status: 'Diproses',
      waktu: new Date().toISOString(),
      catatan: `Pelapor membuka kembali tiket: "${reason}"`,
      petugas: 'Pelapor (Tiket Dibuka Kembali)'
    });

    currentSelectedTicket = ticketsState[index];
    saveLocalStorage(ticketsState);

    if (isCloudMode && supabaseClient) {
      try {
        await supabaseClient
          .from('tickets')
          .update({ status: 'Diproses' })
          .eq('id', currentSelectedTicket.id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }

    closeReopenTicketModal();
    populatePage2(currentSelectedTicket);
    updateDashboardStats();
    showToast(`Tiket ${currentSelectedTicket.nomor_tiket} dibuka kembali untuk pemeriksaan petugas.`);
  }
}

/* =========================================================================
   9. PAGE 3: TABEL ANTREAN & UPDATE STATUS (PORTAL PETUGAS)
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
      (t.nama_asli && t.nama_asli.toLowerCase().includes(searchVal)) ||
      (t.kategori && t.kategori.toLowerCase().includes(searchVal)) ||
      (t.lokasi && t.lokasi.toLowerCase().includes(searchVal)) ||
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

    // 3. Kategori & Lokasi
    const tdKategori = document.createElement('td');
    tdKategori.className = 'px-4 py-3 text-slate-600 whitespace-nowrap';
    const katText = document.createElement('p');
    katText.className = 'font-bold text-slate-800';
    katText.textContent = item.kategori;
    const lokText = document.createElement('p');
    lokText.className = 'text-[11px] text-slate-400 truncate max-w-[140px]';
    lokText.textContent = item.lokasi || 'Kampus';
    tdKategori.appendChild(katText);
    tdKategori.appendChild(lokText);
    tr.appendChild(tdKategori);

    // 4. Rincian Aduan (Anti-XSS dengan textContent)
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

    tr.addEventListener('click', () => {
      selectTicketForPage3(item);
    });

    tbody.appendChild(tr);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-slate-400 text-xs">
          Tidak ada data aspirasi yang cocok dengan pencarian atau filter.
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
  const errorEl = document.getElementById('p3CatatanError');
  if (errorEl) errorEl.classList.add('hidden');

  if (!ticket) {
    const elNomor = document.getElementById('p3DetailNomor');
    const elPelapor = document.getElementById('p3DetailPelapor');
    const elLokasi = document.getElementById('p3DetailLokasi');
    const elKat = document.getElementById('p3DetailKategori');
    const elDesk = document.getElementById('p3DetailDeskripsi');
    const elStatus = document.getElementById('p3SelectStatus');
    const elCatatan = document.getElementById('p3CatatanPenanganan');
    const fotoContainer = document.getElementById('p3DetailFotoContainer');

    if (elNomor) elNomor.textContent = '-';
    if (elPelapor) elPelapor.textContent = '-';
    if (elLokasi) elLokasi.textContent = '-';
    if (elKat) elKat.textContent = '-';
    if (elDesk) elDesk.textContent = 'Belum ada data aspirasi yang dipilih.';
    if (elStatus) elStatus.value = 'Pending';
    if (elCatatan) elCatatan.value = '';
    if (fotoContainer) fotoContainer.classList.add('hidden');
    if (badge) {
      badge.textContent = '-';
      badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200';
    }
    return;
  }

  document.getElementById('p3DetailNomor').textContent = ticket.nomor_tiket;
  
  const elPelapor = document.getElementById('p3DetailPelapor');
  if (elPelapor) {
    if (ticket.is_anonim) {
      elPelapor.innerHTML = `<span>Sivitas Akademika (Anonim)</span> <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">ID: ${ticket.pelapor_id || ticket.nim || 'Mhs'}</span>`;
    } else {
      elPelapor.textContent = ticket.nama_pelapor;
    }
  }

  const elLokasi = document.getElementById('p3DetailLokasi');
  if (elLokasi) elLokasi.textContent = ticket.lokasi || 'Lingkungan Kampus';

  document.getElementById('p3DetailKategori').textContent = ticket.kategori;
  document.getElementById('p3DetailDeskripsi').textContent = ticket.deskripsi;
  document.getElementById('p3SelectStatus').value = ticket.status;

  const elCatatan = document.getElementById('p3CatatanPenanganan');
  if (elCatatan) elCatatan.value = ticket.catatan_penanganan || '';

  // Foto Bukti
  const fotoContainer = document.getElementById('p3DetailFotoContainer');
  const fotoImg = document.getElementById('p3DetailFotoImg');
  if (fotoContainer && fotoImg) {
    if (ticket.lampiran_foto) {
      fotoImg.src = ticket.lampiran_foto;
      fotoContainer.classList.remove('hidden');
    } else {
      fotoContainer.classList.add('hidden');
    }
  }

  badge.textContent = ticket.status;
  if (ticket.status === 'Pending') {
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200';
  } else if (ticket.status === 'Diproses') {
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200';
  } else {
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
}

// UPDATE STATUS TIKET OLEH PETUGAS
async function handleUpdateStatusPage3() {
  if (!currentSelectedTicket) {
    showToast('Pilih tiket terlebih dahulu untuk diperbarui.');
    return;
  }

  const newStatus = document.getElementById('p3SelectStatus').value;
  const catatanInput = document.getElementById('p3CatatanPenanganan');
  const catatan = catatanInput ? catatanInput.value.trim() : '';
  const errorEl = document.getElementById('p3CatatanError');

  // Validasi: Wajib mengisi catatan penanganan / solusi sebelum mengubah status ke Diproses atau Selesai
  if ((newStatus === 'Diproses' || newStatus === 'Selesai') && (!catatan || catatan.length < 5)) {
    if (errorEl) {
      errorEl.textContent = `Wajib mengisi "Catatan Penanganan / Solusi" minimal 5 karakter sebelum mengubah status ke '${newStatus}'.`;
      errorEl.classList.remove('hidden');
    }
    if (catatanInput) catatanInput.focus();
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');

  const index = ticketsState.findIndex(t => t.id === currentSelectedTicket.id);
  if (index !== -1) {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const petugasName = user ? user.nama : 'Yusuf Anggit Prasetyo (Dosen)';

    ticketsState[index].status = newStatus;
    ticketsState[index].catatan_penanganan = catatan;
    ticketsState[index].riwayat = ticketsState[index].riwayat || [];
    ticketsState[index].riwayat.push({
      status: newStatus,
      waktu: new Date().toISOString(),
      catatan: catatan || `Status tiket diperbarui menjadi ${newStatus}.`,
      petugas: petugasName
    });

    currentSelectedTicket = ticketsState[index];
    saveLocalStorage(ticketsState);

    if (isCloudMode && supabaseClient) {
      try {
        await supabaseClient
          .from('tickets')
          .update({ status: newStatus })
          .eq('id', currentSelectedTicket.id);
      } catch (e) {
        console.warn('Gagal sinkron status ke Supabase Cloud:', e);
      }
    }

    renderPage3Table();
    selectTicketForPage3(currentSelectedTicket);
    updateDashboardStats();
    showToast(`Status tiket ${currentSelectedTicket.nomor_tiket} diperbarui menjadi '${newStatus}'!`);
  }
}
