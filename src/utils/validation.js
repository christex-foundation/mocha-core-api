//@ts-check

/**
 * Validates required fields for confirming an intent
 * @param {Array} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 */
export function validateConfirmationIntent([intent]) {
  const baseValidation = validateBaseIntent(intent);
  if (baseValidation) return baseValidation;

  const requiredFields = ['amount', 'currency', 'from_number', 'to_number'];
  const missingFields = requiredFields.filter((field) => !intent[field]);

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  return null;
}

/**
 * Validates required fields for cancelling an intent
 * @param {Array} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 */
export function validateCancellationIntent([intent]) {
  if (intent.cancelled_at) {
    return 'Intent object is already cancelled';
  }

  return null;
}

/**
 * Validates required fields for deleting an intent
 * @param {Array} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 */
export function validateDeleteIntent([intent]) {
  return validateBaseIntent(intent);
}

/**
 * Validates fields for updating an intent
 *
 * @param {Array} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 *
 */
export function validateUpdateIntent([intent]) {
  return validateBaseIntent(intent);
}

/**
 * Validates the base conditions for an intent
 * @param {Object} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 */
function validateBaseIntent(intent) {
  if (intent.confirmed_at) {
    return 'Intent object is already confirmed';
  }

  if (intent.cancelled_at) {
    return 'Intent object is already cancelled';
  }

  return null;
}
