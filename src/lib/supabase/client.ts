import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hbekdutsineitvrghcui.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_npHOglpUjq9kS9--oy6Teg_Iqbb9-bn';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
