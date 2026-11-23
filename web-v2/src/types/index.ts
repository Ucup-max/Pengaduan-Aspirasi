export type TicketStatus = 'Pending' | 'Diproses' | 'Selesai';

export type UserRole = 'mahasiswa' | 'dosen' | 'petugas';

export interface UserAccount {
  nim: string;
  nama: string;
  kelas: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface TicketHistoryItem {
  status: TicketStatus;
  waktu: string;
  catatan: string;
  petugas: string;
  bukti_foto?: string | null;
}

export interface Ticket {
  id: number;
  nomor_tiket: string;
  nama_pelapor: string;
  nama_asli?: string;
  pelapor_id?: string;
  is_anonim?: boolean;
  kategori: string;
  lokasi?: string;
  deskripsi: string;
  status: TicketStatus;
  lampiran_foto?: string | null;
  catatan_penanganan?: string;
  bukti_penyelesaian?: string | null;
  created_at: string;
  riwayat?: TicketHistoryItem[];
  konfirmasi_selesai?: boolean;
  rating?: number | null;
  feedback?: string;
}

export interface TicketCategoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeClass: string;
}

export interface TicketStats {
  total: number;
  pending: number;
  diproses: number;
  selesai: number;
}
