import { redirect } from 'next/navigation';

export default function AntreanRedirect() {
  redirect('/petugas/dashboard?filter=Pending');
}
