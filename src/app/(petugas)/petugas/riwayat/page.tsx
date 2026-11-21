import { redirect } from 'next/navigation';

export default function RiwayatPetugasRedirect() {
  redirect('/petugas/dashboard?filter=Selesai');
}
