import { redirect } from 'next/navigation';

export default function DiprosesRedirect() {
  redirect('/petugas/dashboard?filter=Diproses');
}
