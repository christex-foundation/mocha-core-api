//@ts-check
import { hashApiKey } from '../utils/crypto';
import { createSupabaseClient } from '../utils/supabase.mjs';

const supabase = createSupabaseClient();

/**
 * Inserts a new API key record into the database.
 * @param {Object} apiKeyData - The API key data to insert.
 * @returns {Promise<Object>} The inserted API key data.
 * @throws Will throw an error if the database operation fails.
 */
export async function insertAPIKey(apiKeyData) {
  const { data, error } = await supabase.from('auth_api_keys').insert(apiKeyData).select().single();

  if (error) throw error;
  return data;
}

/**
 * Verifies an API key.
 * @param {string} apiKey - The API key to verify.
 * @returns {Promise<Object|null>} The API key data if valid, null otherwise.
 */
export async function verifyAPIKey(apiKey) {
  const keyHash = hashApiKey(apiKey);

  // Check if the API key exists, is active, and not expired
  const { data, error } = await supabase
    .from('auth_api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error) return null;
  return data;
}

/**
 * Retrieves an API key by its hash.
 * @param {string} keyHash - The hash of the API key.
 * @returns {Promise<Object|null>} The API key data if found, null otherwise.
 */
export async function getAPIKeyByHash(keyHash) {
  const { data, error } = await supabase
    .from('auth_api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .single();

  if (error) return null;
  return data;
}

/**
 * Updates the last used timestamp for an API key.
 * @param {string} apiKeyId - The ID of the API key.
 * @throws Will throw an error if the database operation fails.
 */
export async function updateAPIKeyLastUsed(apiKeyId) {
  const { error } = await supabase
    .from('auth_api_keys')
    .update({ last_used_at: new Date() })
    .eq('id', apiKeyId);

  if (error) throw error;
}

/**
 * Updates an API key's active status.
 * @param {string} apiKeyId - The ID of the API key.
 * @param {boolean} isActive - The new active status.
 * @throws Will throw an error if the database operation fails.
 */
export async function updateAPIKeyStatus(apiKeyId, isActive) {
  const { error } = await supabase
    .from('auth_api_keys')
    .update({ is_active: isActive })
    .eq('id', apiKeyId);

  if (error) throw error;
}

/**
 * Updates the permissions for an API key.
 * @param {string} apiKeyId - The ID of the API key.
 * @param {Object} permissions - The new permissions object.
 * @throws Will throw an error if the database operation fails.
 */
export async function updateAPIKeyPermissions(apiKeyId, permissions) {
  const { error } = await supabase.from('auth_api_keys').update({ permissions }).eq('id', apiKeyId);

  if (error) throw error;
}

/**
 * Updates the rate limit for an API key.
 * @param {string} apiKeyId - The ID of the API key.
 * @param {number} rateLimit - The new rate limit.
 * @throws Will throw an error if the database operation fails.
 */
export async function updateAPIKeyRateLimit(apiKeyId, rateLimit) {
  const { error } = await supabase
    .from('auth_api_keys')
    .update({ rate_limit: rateLimit })
    .eq('id', apiKeyId);

  if (error) throw error;
}
