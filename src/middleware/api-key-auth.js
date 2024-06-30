//@ts-check

import { verifyAPIKey, updateAPIKeyLastUsed } from '../repos/api-keys.js';

/**
 * Middleware to authenticate requests using an API key.
 */
export async function apiKeyAuth(c, next) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    console.error('API key is required');
    return c.json({ error: 'API key is required' }, 401);
  }

  const keyData = await verifyAPIKey(apiKey);

  if (!keyData) {
    console.error('Invalid or inactive API key', { apiKey });
    return c.json({ error: 'Invalid or inactive API key' }, 401);
  }

  // Update last used timestamp
  await updateAPIKeyLastUsed(keyData.id);

  // Add client info to the context for use in route handlers
  c.set('clientId', keyData.client_id);

  return next();
}
