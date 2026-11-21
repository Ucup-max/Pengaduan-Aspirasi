# Portal Aspirasi Mahasiswa v2.1 (Next.js 16 + Supabase SSR)

Aplikasi resmi pengaduan dan aspirasi sivitas akademika kampus dengan pemisahan peran total:
- **Mahasiswa**: Pelaporan aspirasi cepat, pelacakan progres tiket, konfirmasi kepuasan.
- **Petugas / Command Center**: Manajemen antrean tiket, penanganan SLA ≤ 24 jam, pembaruan status, dan audit log tindak lanjut.

## Vercel Deployment Settings
- **Framework Preset**: Next.js
- **Root Directory**: `web-v2`
- **Build Command**: `npm run build`
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
