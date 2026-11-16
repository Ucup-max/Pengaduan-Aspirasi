/* =========================================================================
   PORTAL ASPIRASI MAHASISWA - CONFIGURATION LAYER
   Separation of Concerns: Configuration & Environment Constants
   ========================================================================= */

// Tailwind CSS Extended Config
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        },
        colors: {
          brand: {
            50: '#f8fafc',
            100: '#f1f5f9',
            900: '#0f172a',
          }
        }
      }
    }
  };
}

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://hbekdutsineitvrghcui.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_npHOglpUjq9kS9--oy6Teg_Iqbb9-bn';

// Helper validator apakah Supabase cloud sudah terkonfigurasi dengan benar
const isCloudSupabaseConfigured = () => {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_URL.includes('.supabase.co') &&
    SUPABASE_ANON_KEY !== 'GANTI_DENGAN_SUPABASE_ANON_KEY_ANDA' &&
    SUPABASE_ANON_KEY.length > 20
  );
};

// Storage Keys
const LOCAL_STORAGE_KEY = 'ASPIRASI_PENPOT_TICKETS_V2';
const MY_TICKETS_KEY = 'ASPIRASI_MY_TICKETS_HISTORY_V1';
const SESSION_USER_KEY = 'PORTAL_AUTH_CURRENT_USER_V1';

// Administrator Password untuk RBAC
const ADMIN_PASSWORD = 'Fira Cantik';

// =========================================================================
// BASIS DATA AKUN PENGGUNA RESMI (DARI EXCEL / SINKRONISASI KAMPUS)
// Aturan Khusus: NIM 260102037 (YUSUF ANGGIT PRASETYO) memiliki peran DOSEN
// =========================================================================
const USER_ACCOUNTS = [
  { nim: "260102003", nama: "NESHRIN FEBRILIANA", kelas: "TI1D", username: "260102003", password: "S!G-JYoJcLf1uvZgCDtcaT", role: "mahasiswa" },
  { nim: "260102013", nama: "BIMO KUSUMA BRAHMANTYO", kelas: "TI1D", username: "260102013", password: "S!PtmzqFBUtehgbv6S08eK", role: "mahasiswa" },
  { nim: "260102017", nama: "DIVA AULIA NITISANDRA", kelas: "TI1D", username: "260102017", password: "S!0gi3wSHy9Zm2RSWa072N", role: "mahasiswa" },
  { nim: "260102020", nama: "FIRZY KUSUMA ARGINATA", kelas: "TI1D", username: "260102020", password: "S!bzeEz6ANjAB8gaxokESf", role: "mahasiswa" },
  { nim: "260102024", nama: "LAILATUN NIHAYAH", kelas: "TI1D", username: "260102024", password: "S!j0WWLIcGoJDv5-KDRIZw", role: "mahasiswa" },
  { nim: "260102027", nama: "MUZZAMIL YAHYA ALFAQIH", kelas: "TI1D", username: "260102027", password: "S!8E3HN67oYPK4shYmZokT", role: "mahasiswa" },
  { nim: "260102032", nama: "RAYZA AULIA MAHARANI", kelas: "TI1D", username: "260102032", password: "S!g15dtrTQiJM_BiVL1h46", role: "mahasiswa" },
  
  // KHUSUS: YUSUF ANGGIT PRASETYO DITETAPKAN SEBAGAI DOSEN
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
  { nim: "260302059", nama: "IRFAN DWI MEIRAMDANI", kelas: "TI1D", username: "260302059", password: "S!kzppitMZXUKHM8I0xyFM", role: "mahasiswa" },
  
  // Akun Administrator Sistem
  { nim: "ADMIN01", nama: "Admin Help Desk", kelas: "BIRO TI", username: "admin", password: "Fira Cantik", role: "admin" }
];
