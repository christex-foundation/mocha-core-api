//@ts-check
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  // @ts-ignore
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_PUBLC);
}
