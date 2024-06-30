//@ts-check
import crypto from 'crypto';

/**
 * Hashes an API key using HMAC-SHA256.
 * @param {string} apiKey - The API key to hash.
 * @returns {string} The hashed API key.
 */
export function hashApiKey(apiKey) {
  // @ts-ignore
  return crypto.createHmac('sha256', process.env.API_KEY_SALT).update(apiKey).digest('hex');
}

/**
 * Creates a new API key.
 * @returns {string} The generated API key.
 */
export function generateAPIKey() {
  return crypto.randomBytes(32).toString('hex');
}
