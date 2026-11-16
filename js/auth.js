/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - AUTH & ACCESS CONTROL LAYER (RBAC)
   Separation of Concerns: Role-Based Access Control & Password Verification
   ========================================================================= */

function handleRoleSwitch(newRole) {
  if (newRole === 'admin') {
    if (currentRole === 'admin') {
      showToast('Anda sudah berada dalam peran Administrator.');
      return;
    }
    // Wajib verifikasi kata sandi untuk beralih ke admin
    openAdminPasswordModal();
    return;
  }

  // Jika beralih ke Mahasiswa, tidak perlu memasukkan kata sandi
  executeRoleSwitch('mahasiswa');
}

function executeRoleSwitch(newRole) {
  currentRole = newRole;
  localStorage.setItem('APP_USER_ROLE', newRole);
  applyRBAC();

  const roleName = newRole === 'admin' ? '🛡️ Administrator (Akses Penuh)' : '🎓 Mahasiswa (Pelapor)';
  showToast(`Peran aktif beralih ke: ${roleName}`);

  // TRANSISI OTOMATIS ANTAR HALAMAN BERDASARKAN ROLE
  if (newRole === 'admin') {
    // Jika beralih ke Admin, langsung buka halaman Antrean Aspirasi (Page 3)
    switchPage('page3');
  } else {
    // Jika beralih ke Mahasiswa dan sedang berada di halaman Antrean (Page 3), kembalikan ke Form Aspirasi (Page 1)
    const p3View = document.getElementById('view-page3');
    if (p3View && !p3View.classList.contains('hidden')) {
      switchPage('page1');
    }
  }
}

function toggleRoleQA() {
  const nextRole = currentRole === 'admin' ? 'mahasiswa' : 'admin';
  handleRoleSwitch(nextRole);
}

/* Modal Autentikasi Kata Sandi Admin */
function openAdminPasswordModal() {
  const modal = document.getElementById('adminPasswordModal');
  const passInput = document.getElementById('adminPasswordInput');
  const errorBox = document.getElementById('adminPasswordError');

  if (errorBox) errorBox.classList.add('hidden');
  if (passInput) {
    passInput.value = '';
    passInput.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
  }
  if (modal) modal.classList.remove('hidden');

  setTimeout(() => {
    if (passInput) passInput.focus();
  }, 120);
}

function closeAdminPasswordModal() {
  const modal = document.getElementById('adminPasswordModal');
  if (modal) modal.classList.add('hidden');

  // Kembalikan sinkronisasi visual ke role saat ini
  applyRBAC();
}

function toggleShowAdminPassword() {
  const input = document.getElementById('adminPasswordInput');
  const icon = document.getElementById('adminPasswordEyeIcon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = `
      <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
      </svg>
    `;
  } else {
    input.type = 'password';
    icon.innerHTML = `
      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
    `;
  }
}

function submitAdminPassword() {
  const passInput = document.getElementById('adminPasswordInput');
  const errorBox = document.getElementById('adminPasswordError');
  const errorText = document.getElementById('adminPasswordErrorText');
  const inputVal = passInput ? passInput.value.trim() : '';

  if (inputVal === ADMIN_PASSWORD) {
    // Kata sandi benar!
    closeAdminPasswordModal();
    executeRoleSwitch('admin');
    showToast('🛡️ Otorisasi Berhasil! Selamat datang, Administrator.');
  } else {
    // Kata sandi salah!
    if (errorBox) errorBox.classList.remove('hidden');
    if (errorText) errorText.textContent = 'Kata sandi salah! Akses Administrator ditolak.';
    if (passInput) {
      passInput.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
      passInput.focus();
      passInput.select();
    }
  }
}

function applyRBAC() {
  // 1. Sinkronisasi Selector Dropdown di Sidebar
  const selector = document.getElementById('roleSelector');
  if (selector) selector.value = currentRole;

  // 2. Sinkronisasi Tombol Cepat di Top Header
  const btnHeaderMhs = document.getElementById('toggleHeaderMahasiswa');
  const btnHeaderAdm = document.getElementById('toggleHeaderAdmin');
  const adminBanner = document.getElementById('adminModeBanner');

  // 3. Elemen-elemen visual role
  const badgeIndicator = document.getElementById('roleBadgeIndicator');
  const topRoleBadge = document.getElementById('topHeaderRoleBadge');
  const topRoleText = document.getElementById('topHeaderRoleText');
  const topRoleDot = document.getElementById('topHeaderRoleDot');
  const userAvatar = document.getElementById('userAvatar');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userRoleDesc = document.getElementById('userRoleDesc');
  const navPage3 = document.getElementById('nav-page3');
  const navLockBadge = document.getElementById('navLockBadge');
  const qaRolePill = document.getElementById('qaRolePill');
  const btnPage2ToPage3Text = document.getElementById('btnPage2ToPage3Text');

  if (currentRole === 'admin') {
    // ================= MODE ADMINISTRATOR (FULL ACCESS) =================
    if (btnHeaderAdm) {
      btnHeaderAdm.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-slate-900 text-white';
    }
    if (btnHeaderMhs) {
      btnHeaderMhs.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900';
    }
    if (adminBanner) {
      adminBanner.classList.remove('hidden');
    }

    if (badgeIndicator) {
      badgeIndicator.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200';
      badgeIndicator.textContent = 'Administrator';
    }
    if (topRoleBadge) {
      topRoleBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (topRoleText) topRoleText.textContent = 'Role: Administrator (Akses Penuh)';
    if (topRoleDot) topRoleDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse';

    if (userAvatar) {
      userAvatar.className = 'w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0';
      userAvatar.textContent = 'AD';
    }
    if (userNameDisplay) userNameDisplay.textContent = 'Admin Help Desk';
    if (userRoleDesc) userRoleDesc.textContent = 'Petugas • Biro TI & Sarana';

    if (navLockBadge) {
      navLockBadge.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1';
      navLockBadge.innerHTML = `
        <svg class="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Akses Penuh</span>
      `;
    }
    if (navPage3) {
      navPage3.classList.remove('opacity-60');
      navPage3.title = 'Akses Antrean Terbuka untuk Admin';
    }
    if (qaRolePill) {
      qaRolePill.className = 'text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800';
      qaRolePill.textContent = 'Admin (Full)';
    }
    if (btnPage2ToPage3Text) {
      btnPage2ToPage3Text.textContent = 'Kelola di Antrean Aspirasi (Admin) →';
    }
    const qaPanel = document.getElementById('qaQuickTestPanel');
    if (qaPanel) {
      qaPanel.classList.remove('hidden');
    }

  } else {
    // ================= MODE MAHASISWA (RESTRICTED ACCESS) =================
    if (btnHeaderMhs) {
      btnHeaderMhs.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-indigo-600 text-white';
    }
    if (btnHeaderAdm) {
      btnHeaderAdm.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900';
    }
    if (adminBanner) {
      adminBanner.classList.add('hidden');
    }

    if (badgeIndicator) {
      badgeIndicator.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200';
      badgeIndicator.textContent = 'Mahasiswa';
    }
    if (topRoleBadge) {
      topRoleBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200';
    }
    if (topRoleText) topRoleText.textContent = 'Role: Mahasiswa';
    if (topRoleDot) topRoleDot.className = 'w-1.5 h-1.5 rounded-full bg-indigo-600';

    if (userAvatar) {
      userAvatar.className = 'w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0';
      const inputPelapor = document.getElementById('nama_pelapor');
      const nameVal = inputPelapor ? inputPelapor.value.trim() : '';
      if (nameVal) {
        userAvatar.textContent = nameVal.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'M';
      } else {
        userAvatar.textContent = 'M';
      }
    }
    if (userNameDisplay) {
      const inputPelapor = document.getElementById('nama_pelapor');
      userNameDisplay.textContent = (inputPelapor && inputPelapor.value.trim()) ? inputPelapor.value.trim() : 'Mahasiswa';
    }
    if (userRoleDesc) userRoleDesc.textContent = 'Pelapor • Sivitas Kampus';

    if (navLockBadge) {
      navLockBadge.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1';
      navLockBadge.innerHTML = `
        <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
        </svg>
        <span>Khusus Admin</span>
      `;
    }
    if (navPage3) {
      navPage3.classList.add('opacity-75');
      navPage3.title = 'Terkunci: Khusus Role Admin';
    }
    if (qaRolePill) {
      qaRolePill.className = 'text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800';
      qaRolePill.textContent = 'Mahasiswa';
    }
    if (btnPage2ToPage3Text) {
      btnPage2ToPage3Text.textContent = 'Lihat Panduan & SOP →';
    }
    const qaPanel = document.getElementById('qaQuickTestPanel');
    if (qaPanel) {
      qaPanel.classList.add('hidden');
    }

    // Jangan prefill nama pengguna, biarkan kosong agar diisi manual oleh mahasiswa
    const inputPelapor = document.getElementById('nama_pelapor');
    if (inputPelapor && inputPelapor.value === 'Admin Help Desk') {
      inputPelapor.value = '';
    }
  }
}

function openAccessDeniedModal(featureName) {
  document.getElementById('deniedFeatureName').textContent = featureName || 'Antrean Aspirasi';
  document.getElementById('accessDeniedModal').classList.remove('hidden');
}

function closeAccessDeniedModal() {
  document.getElementById('accessDeniedModal').classList.add('hidden');
}

function elevateToAdminAndOpen() {
  closeAccessDeniedModal();
  handleRoleSwitch('admin');
}
