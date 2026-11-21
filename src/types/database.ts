export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: number
          nomor_tiket: string
          nama_pelapor: string
          kategori: string
          deskripsi: string
          status: 'Pending' | 'Diproses' | 'Selesai'
          created_at: string
          lokasi: string | null
          is_anonim: boolean | null
          lampiran_foto: string | null
          catatan_penanganan: string | null
          riwayat: Json | null
          konfirmasi_selesai: boolean | null
          rating: number | null
          feedback: string | null
        }
        Insert: {
          id?: never
          nomor_tiket: string
          nama_pelapor: string
          kategori: string
          deskripsi: string
          status?: 'Pending' | 'Diproses' | 'Selesai'
          created_at?: string
          lokasi?: string | null
          is_anonim?: boolean | null
          lampiran_foto?: string | null
          catatan_penanganan?: string | null
          riwayat?: Json | null
          konfirmasi_selesai?: boolean | null
          rating?: number | null
          feedback?: string | null
        }
        Update: {
          id?: never
          nomor_tiket?: string
          nama_pelapor?: string
          kategori?: string
          deskripsi?: string
          status?: 'Pending' | 'Diproses' | 'Selesai'
          created_at?: string
          lokasi?: string | null
          is_anonim?: boolean | null
          lampiran_foto?: string | null
          catatan_penanganan?: string | null
          riwayat?: Json | null
          konfirmasi_selesai?: boolean | null
          rating?: number | null
          feedback?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
