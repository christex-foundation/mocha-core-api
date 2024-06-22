//@ts-check
// Intents Repository

import { createSupabaseClient } from '../utils/supabase.mjs';
const supabase = createSupabaseClient();

export async function createIntent(data) {
  return await supabase.from('intents').insert(data).select();
}

export async function updateIntent(id, data) {
  return await supabase.from('intents').update(data).eq('id', id).select();
}

export async function fetchAllIntents() {
  return await supabase.from('intents').select();
}

export async function fetchAllUserIntents(from_number) {
  return await supabase.from('intents').select().eq('from_number', from_number);
}

export async function fetchIntentById(id) {
  return await supabase.from('intents').select().eq('id', id);
}

export async function confirmIntent(id, from_number, data) {
  return await supabase
    .from('intents')
    .update(data)
    .eq('id', id)
    .eq('client_secret', `client_secret_${from_number}`)
    .select();
}

export async function cancelIntent(id, data) {
  return await supabase.from('intents').update(data).eq('id', id);
}

export async function searchIntents(query) {
  return await supabase
    .from('intents')
    .select()
    .or(`description.ilike.%${query}%,cancellation_reason.ilike.%${query}%`);
}

export async function deleteIntent(id) {
  return await supabase.from('intents').delete().eq('id', id);
}
