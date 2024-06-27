/**
 * Validates required fields for an intent
 * @param {Object} intent - The intent object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {string|null} Error message if validation fails, null otherwise
 */
export function validateIntentFields(intent, requiredFields) {
  if (intent.confirmed_at) {
    return 'Intent object is already confirmed';
  }

  if (intent.cancelled_at) {
    return 'Intent object is already cancelled';
  }

  const missingFields = requiredFields.filter((field) => !intent[field]);

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  return null;
}
