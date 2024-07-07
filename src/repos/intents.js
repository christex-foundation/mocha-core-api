//@ts-check
// Intents Repository
import { createSupabaseClient } from '../utils/supabase.js';

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

export async function confirmIntent(id, data) {
  return await updateIntent(id, data);
}

export async function cancelIntent(id, data) {
  return await updateIntent(id, data);
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

export async function fetchIntentByTransactionID(transactionId) {
  return await supabase.from('intents').select().eq('transaction_id', transactionId);
}
