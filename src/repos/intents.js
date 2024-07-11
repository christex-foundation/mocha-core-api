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

/**
 * Fetch all intents for a specific application
 * @param {string} application - The application ID
 */
export async function fetchAllIntents(application) {
  return await supabase.from('intents').select().eq('application', application);
}

/**
 * Fetch all intents for a specific user
 * @param {string} from_number - The user's phone number
 * @param {string} application - The application ID
 *
 */
export async function fetchAllUserIntents(from_number, application) {
  return await supabase
    .from('intents')
    .select()
    .eq('from_number', from_number)
    .eq('application', application);
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

/**
 * Search intents based on description or cancellation reason
 * @param {string} query - The search query
 * @param {string} application - The application ID
 */
export async function searchIntents(query, application) {
  return await supabase
    .from('intents')
    .select()
    .or(`description.ilike.%${query}%,cancellation_reason.ilike.%${query}%`)
    .eq('application', application);
}

export async function deleteIntent(id) {
  return await supabase.from('intents').delete().eq('id', id);
}

export async function fetchIntentByTransactionID(transactionId) {
  return await supabase.from('intents').select().eq('transaction_id', transactionId);
}
