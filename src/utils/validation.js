//@ts-check
/**
 * Validates required fields for confirming an intent
 * @param {Array} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 */
export function validateConfirmationIntent([intent]) {
  if (intent.confirmed_at) {
    return 'Intent object is already confirmed';
  }

  if (intent.cancelled_at) {
    return 'Intent object is already cancelled';
  }

  const requiredFields = ['amount', 'amount_received', 'currency', 'from_number', 'to_number'];
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
  if (intent.confirmed_at) {
    return 'Intent object is already confirmed';
  }

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
  if (intent.confirmed_at) {
    return 'Intent object is already confirmed';
  }

  if (intent.cancelled_at) {
    return 'Intent object is already cancelled';
  }

  return null;
}

/**
 * Validates fields for updating an intent
 *
 * @param {Array} intent - The intent object to validate
 * @returns {string|null} Error message if validation fails, null otherwise
 *
 */
export function validateUpdateIntent([intent]) {
  if (intent.confirmed_at) {
    return 'Intent object is already confirmed';
  }

  if (intent.cancelled_at) {
    return 'Intent object is already cancelled';
  }

  return null;
}
