/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - AUTH & ACCESS CONTROL LAYER (RBAC)
   Separation of Concerns: Role-Based Access Control, Session & Login
   ========================================================================= */

/* =========================================================================
   1. SESSION & AUTHENTICATION STATE
   ========================================================================= */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (!user) return;
  try {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Gagal menyimpan sesi pengguna:', e);
  }
}

function clearCurrentUser() {
  try {
    localStorage.removeItem(SESSION_USER_KEY);
  } catch (e) {
    console.warn(e);
  }
}

function checkAuth() {
  return !!getCurrentUser();
}

function loginUser(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: 'NIM / Username dan kata sandi wajib diisi.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  // Cari di basis data akun USER_ACCOUNTS
  const user = USER_ACCOUNTS.find(u => 
    (u.nim && u.nim.toLowerCase() === cleanId) || 
    (u.username && u.username.toLowerCase() === cleanId)
  );

  if (!user) {
    return { success: false, message: 'NIM atau Username tidak terdaftar dalam pangkalan data kampus.' };
  }

  if (user.password !== cleanPass) {
    return { success: false, message: 'Kata sandi tidak sesuai. Perhatikan huruf besar/kecil dan karakter khusus.' };
  }

  // Sukses verifikasi
  setCurrentUser(user);
  currentRole = user.role;
  localStorage.setItem('APP_USER_ROLE', user.role);

  return { success: true, user };
}

function logoutUser() {
  clearCurrentUser();
  currentRole = 'mahasiswa';
  localStorage.setItem('APP_USER_ROLE', 'mahasiswa');

  const appLayout = document.getElementById('appLayoutWrapper');
  const loginView = document.getElementById('view-login');

  if (appLayout) appLayout.classList.add('hidden');
  if (loginView) {
    loginView.classList.remove('hidden');
    loginView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Bersihkan field password
  const passInput = document.getElementById('loginPassword');
  if (passInput) passInput.value = '';

  const errBox = document.getElementById('loginErrorBox');
  if (errBox) errBox.classList.add('hidden');

  showToast('Anda telah berhasil keluar dari akun.');
}

/* =========================================================================
   2. LOGIN SCREEN INTERACTION HELPERS
   ========================================================================= */
let currentLoginTab = 'mahasiswa';

function setLoginRoleTab(tabRole) {
  currentLoginTab = tabRole;
  const tabMhs = document.getElementById('tabLoginMahasiswa');
  const tabDosen = document.getElementById('tabLoginDosen');
  const label = document.getElementById('loginUsernameLabel');
  const input = document.getElementById('loginUsername');

  if (tabRole === 'dosen') {
    if (tabDosen) {
      tabDosen.className = 'flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all bg-white text-slate-900 shadow-xs cursor-pointer font-bold';
    }
    if (tabMhs) {
      tabMhs.className = 'flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-slate-500 hover:text-slate-800 cursor-pointer font-medium';
    }
    if (label) label.textContent = 'Nomor Induk Dosen / NIM Yusuf Anggit';
    if (input) input.placeholder = 'Contoh: 260102037';
  } else {
    if (tabMhs) {
      tabMhs.className = 'flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all bg-white text-slate-900 shadow-xs cursor-pointer font-bold';
    }
    if (tabDosen) {
      tabDosen.className = 'flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-slate-500 hover:text-slate-800 cursor-pointer font-medium';
    }
    if (label) label.textContent = 'Nomor Induk Mahasiswa';
    if (input) input.placeholder = 'Contoh: 260302026 atau 260102003';
  }
}

function toggleShowLoginPassword() {
  const input = document.getElementById('loginPassword');
  const icon = document.getElementById('loginEyeIcon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
    `;
    icon.classList.add('text-indigo-600');
  } else {
    input.type = 'password';
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    `;
    icon.classList.remove('text-indigo-600');
  }
}

function fillDemoAccount(identifier) {
  const user = USER_ACCOUNTS.find(u => u.nim === identifier || u.username === identifier);
  if (!user) return;

  const userInput = document.getElementById('loginUsername');
  const passInput = document.getElementById('loginPassword');

  if (user.role === 'dosen') {
    setLoginRoleTab('dosen');
  } else {
    setLoginRoleTab('mahasiswa');
  }

  if (userInput) userInput.value = user.nim || user.username;
  if (passInput) passInput.value = user.password;

  const errBox = document.getElementById('loginErrorBox');
  if (errBox) errBox.classList.add('hidden');

  showToast(`Akun ${user.nama} (${user.role.toUpperCase()}) telah diisikan!`);
}

function handleLoginSubmit(e) {
  e.preventDefault();

  const userInput = document.getElementById('loginUsername');
  const passInput = document.getElementById('loginPassword');
  const errBox = document.getElementById('loginErrorBox');
  const errMsg = document.getElementById('loginErrorMessage');
  const btn = document.getElementById('btnLoginSubmit');
  const btnText = document.getElementById('btnLoginText');
  const spinner = document.getElementById('loginSpinner');

  const usernameVal = userInput ? userInput.value.trim() : '';
  const passwordVal = passInput ? passInput.value.trim() : '';

  if (errBox) errBox.classList.add('hidden');

  if (btn) btn.disabled = true;
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Memverifikasi...';

  setTimeout(() => {
    const result = loginUser(usernameVal, passwordVal);

    if (btn) btn.disabled = false;
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Masuk →';

    if (result.success) {
      const user = result.user;
      const appLayout = document.getElementById('appLayoutWrapper');
      const loginView = document.getElementById('view-login');

      if (loginView) loginView.classList.add('hidden');
      if (appLayout) appLayout.classList.remove('hidden');

      applyUserProfile(user);
      applyRBAC();
      switchPage('home');
      updateDashboardStats();

      const roleLabel = user.role === 'dosen' ? 'Dosen' : (user.role === 'admin' ? 'Administrator' : 'Mahasiswa');
      showToast(`Selamat datang, ${user.nama}! Anda masuk sebagai ${roleLabel}.`);
    } else {
      if (errBox) errBox.classList.remove('hidden');
      if (errMsg) errMsg.textContent = result.message;
      if (passInput) {
        passInput.focus();
        passInput.select();
      }
    }
  }, 350);
}

function applyUserProfile(user) {
  if (!user) return;
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userAvatar = document.getElementById('userAvatar');
  const userRoleDesc = document.getElementById('userRoleDesc');
  const inputPelapor = document.getElementById('nama_pelapor');

  if (userNameDisplay) userNameDisplay.textContent = user.nama;
  if (userAvatar) {
    const initials = user.nama.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
    userAvatar.textContent = initials || (user.role === 'dosen' ? 'D' : 'M');
  }
  if (userRoleDesc) {
    if (user.role === 'dosen') {
      userRoleDesc.textContent = `Dosen • Tenaga Pengajar ${user.kelas || ''}`;
    } else if (user.role === 'admin') {
      userRoleDesc.textContent = 'Petugas • Biro TI & Sarana';
    } else {
      userRoleDesc.textContent = `Mahasiswa • Kelas ${user.kelas || 'TI1D'}`;
    }
  }
  if (inputPelapor && user.role !== 'admin') {
    inputPelapor.value = user.nama;
  }
}

/* =========================================================================
   3. ROLE SWITCHING & MODAL ADMIN PASSWORD
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

  executeRoleSwitch(newRole);
}

function executeRoleSwitch(newRole) {
  currentRole = newRole;
  localStorage.setItem('APP_USER_ROLE', newRole);
  applyRBAC();

  const roleName = newRole === 'admin' 
    ? '🛡️ Administrator (Akses Penuh)' 
    : (newRole === 'dosen' ? '📖 Dosen (Tenaga Pengajar)' : '🎓 Mahasiswa (Pelapor)');
  showToast(`Peran aktif beralih ke: ${roleName}`);

  // TRANSISI OTOMATIS ANTAR HALAMAN BERDASARKAN ROLE
  if (newRole === 'admin') {
    switchPage('page3');
  } else {
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
    closeAdminPasswordModal();
    executeRoleSwitch('admin');
    showToast('🛡️ Otorisasi Berhasil! Selamat datang, Administrator.');
  } else {
    if (errorBox) errorBox.classList.remove('hidden');
    if (errorText) errorText.textContent = 'Kata sandi salah! Akses Administrator ditolak.';
    if (passInput) {
      passInput.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-200');
      passInput.focus();
      passInput.select();
    }
  }
}

/* =========================================================================
   4. PENEGAKAN HAK AKSES PERAN (RBAC ENFORCEMENT)
   ========================================================================= */
function applyRBAC() {
  const selector = document.getElementById('roleSelector');
  if (selector) selector.value = currentRole;

  const btnHeaderMhs = document.getElementById('toggleHeaderMahasiswa');
  const btnHeaderDsn = document.getElementById('toggleHeaderDosen');
  const btnHeaderAdm = document.getElementById('toggleHeaderAdmin');
  const adminBanner = document.getElementById('adminModeBanner');

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
  const qaPanel = document.getElementById('qaQuickTestPanel');

  const user = getCurrentUser();

  if (currentRole === 'admin') {
    // ================= MODE ADMINISTRATOR (FULL ACCESS) =================
    if (btnHeaderAdm) {
      btnHeaderAdm.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-slate-900 text-white';
    }
    if (btnHeaderMhs) {
      btnHeaderMhs.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900';
    }
    if (btnHeaderDsn) {
      btnHeaderDsn.classList.add('hidden');
    }
    if (adminBanner) adminBanner.classList.remove('hidden');

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
    if (userNameDisplay) userNameDisplay.textContent = user ? user.nama : 'Admin Help Desk';
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
    if (qaPanel) qaPanel.classList.remove('hidden');

  } else if (currentRole === 'dosen') {
    // ================= MODE DOSEN (KHUSUS YUSUF ANGGIT PRASETYO) =================
    if (btnHeaderMhs) {
      btnHeaderMhs.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900';
    }
    if (btnHeaderAdm) {
      btnHeaderAdm.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900';
    }
    if (btnHeaderDsn) {
      btnHeaderDsn.classList.remove('hidden');
      btnHeaderDsn.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-amber-600 text-white';
    }
    if (adminBanner) adminBanner.classList.add('hidden');

    if (badgeIndicator) {
      badgeIndicator.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200';
      badgeIndicator.textContent = 'Dosen (Pengajar)';
    }
    if (topRoleBadge) {
      topRoleBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200';
    }
    if (topRoleText) topRoleText.textContent = 'Role: Dosen (Tenaga Pengajar)';
    if (topRoleDot) topRoleDot.className = 'w-1.5 h-1.5 rounded-full bg-amber-500';

    if (userAvatar) {
      userAvatar.className = 'w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0';
      userAvatar.textContent = user ? user.nama.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'YA';
    }
    if (userNameDisplay) userNameDisplay.textContent = user ? user.nama : 'Yusuf Anggit Prasetyo';
    if (userRoleDesc) userRoleDesc.textContent = 'Dosen • Tenaga Pengajar TI1D';

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
      qaRolePill.className = 'text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800';
      qaRolePill.textContent = 'Dosen';
    }
    if (btnPage2ToPage3Text) {
      btnPage2ToPage3Text.textContent = 'Lihat Panduan & SOP →';
    }
    if (qaPanel) qaPanel.classList.add('hidden');

    const inputPelapor = document.getElementById('nama_pelapor');
    if (inputPelapor && user) {
      inputPelapor.value = user.nama;
    }

  } else {
    // ================= MODE MAHASISWA (RESTRICTED ACCESS) =================
    if (btnHeaderMhs) {
      btnHeaderMhs.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-indigo-600 text-white';
    }
    if (btnHeaderAdm) {
      btnHeaderAdm.className = 'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900';
    }
    if (btnHeaderDsn) {
      btnHeaderDsn.classList.add('hidden');
    }
    if (adminBanner) adminBanner.classList.add('hidden');

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
      if (user) {
        userAvatar.textContent = user.nama.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'M';
      } else {
        userAvatar.textContent = 'M';
      }
    }
    if (userNameDisplay) {
      userNameDisplay.textContent = user ? user.nama : 'Mahasiswa';
    }
    if (userRoleDesc) {
      userRoleDesc.textContent = user ? `Mahasiswa • Kelas ${user.kelas || 'TI1D'}` : 'Pelapor • Sivitas Kampus';
    }

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
    if (qaPanel) qaPanel.classList.add('hidden');

    const inputPelapor = document.getElementById('nama_pelapor');
    if (inputPelapor && user && user.role !== 'admin') {
      inputPelapor.value = user.nama;
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
