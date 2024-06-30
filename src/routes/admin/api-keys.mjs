//@ts-check

import * as apiKeys from '../../repos/api-keys.mjs';
import { createValidationError } from '../../utils/errors.js';
import { generateAPIKey, hashAPIKey } from '../../utils/crypto.js';

/**
 * Creates a new API key.
 * @param {Object} CreateAPIKeyParams - The parameters for creating the API key.
 * @param {string} CreateAPIKeyParams.clientId - Unique identifier for the client.
 * @param {string} CreateAPIKeyParams.name - Name of the API key.
 * @param {string|null} [CreateAPIKeyParams.businessName=null] - Name of the business (optional).
 * @param {string|null} [CreateAPIKeyParams.appName=null] - Name of the application (optional).
 * @param {number} [CreateAPIKeyParams.expiresInDays=365] - Number of days until the key expires.
 * @param {Object} [CreateAPIKeyParams.permissions={}] - Permissions associated with the key.
 * @param {number} [CreateAPIKeyParams.rateLimit=1000] - Rate limit for the API key.
 * @returns {Promise<Object>} The created API key data.
 * @throws Will throw an error if the operation fails.
 */
export async function createAPIKey({
  clientId,
  name,
  businessName = null,
  appName = null,
  expiresInDays = 365,
  permissions = {},
  rateLimit = 1000,
}) {
  if (!clientId || !name) {
    throw createValidationError('Client ID and name are required');
  }

  const apiKey = generateAPIKey();
  const keyHash = hashAPIKey(apiKey);
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const apiKeyData = {
    client_id: clientId,
    key_hash: keyHash,
    name,
    business_name: businessName,
    app_name: appName,
    expires_at: expiresAt,
    permissions,
    rate_limit: rateLimit,
  };

  const insertedData = await apiKeys.insertAPIKey(apiKeyData);
  return { ...insertedData, apiKey };
}

/**
 * Deactivates an API key.
 * @param {Object} DeactivateAPIKeyParams - The parameters for deactivating the API key.
 * @param {string} DeactivateAPIKeyParams.apiKeyId - The ID of the API key to deactivate.
 * @throws Will throw an error if the operation fails.
 */

export async function deactivateAPIKey({ apiKeyId }) {
  if (!apiKeyId) {
    throw createValidationError('API Key ID is required');
  }

  await apiKeys.updateAPIKeyStatus(apiKeyId, false);
}

/**
 * Updates the permissions for an API key.
 * @param {Object} UpdateAPIKeyPermissionsParams - The parameters for updating the API key permissions.
 * @param {string} UpdateAPIKeyPermissionsParams.apiKeyId - The ID of the API key.
 * @param {Object} UpdateAPIKeyPermissionsParams.permissions - The new permissions object.
 * @throws Will throw an error if the operation fails.
 */
export async function updateAPIKeyPermissions({ apiKeyId, permissions }) {
  if (!apiKeyId || !permissions) {
    throw createValidationError('API Key ID and permissions are required');
  }

  await apiKeys.updateAPIKeyPermissions(apiKeyId, permissions);
}

/**
 * Updates the rate limit for an API key.
 * @param {Object} UpdateAPIKeyRateLimitParams - The parameters for updating the API key rate limit.
 * @param {string} UpdateAPIKeyRateLimitParams.apiKeyId - The ID of the API key.
 * @param {number} UpdateAPIKeyRateLimitParams.rateLimit - The new rate limit.
 * @throws Will throw an error if the operation fails.
 */
export async function updateAPIKeyRateLimit({ apiKeyId, rateLimit }) {
  if (!apiKeyId || !rateLimit) {
    throw createValidationError('API Key ID and rate limit are required');
  }

  await apiKeys.updateAPIKeyRateLimit(apiKeyId, rateLimit);
}
