//@ts-check
import { createClient } from '@supabase/supabase-js'


// Create a single supabase client for interacting with your database
export function createSupabaseClient() {
    // @ts-ignore
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    
}
