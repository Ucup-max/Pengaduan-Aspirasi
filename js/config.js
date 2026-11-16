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

// Administrator Password untuk RBAC
const ADMIN_PASSWORD = 'Fira Cantik';
