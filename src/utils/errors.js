//@ts-check

/**
 * Create a validation error
 * @param {string} message - The error message
 * @returns {Object} A validation error object
 */
export const createValidationError = (message) => ({
  name: 'ValidationError',
  message,
});

/**
 * Create a database error
 * @param {string} message - The error message
 * @returns {Object} A database error object
 */
export const createDatabaseError = (message) => ({
  name: 'DatabaseError',
  message,
});

/**
 * Create a not found error
 * @param {string} message - The error message
 * @returns {Object} A not found error object
 */
export const createNotFoundError = (message) => ({
  name: 'NotFoundError',
  message,
});
