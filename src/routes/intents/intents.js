//@ts-check

// Intents Service
import { ZodError } from 'zod';
import * as intentRepository from '../../repos/intents.js';
import {
  cancelIntentSchema,
  createIntentSchema,
  createStripeIntentSchema,
  searchIntentSchema,
  updateIntentSchema,
} from '../../schemas/intent.js';
import {
  createDatabaseError,
  createNotFoundError,
  createValidationError,
} from '../../utils/errors.js';
import {
  validateCancellationIntent,
  validateConfirmationIntent,
  validateDeleteIntent,
  validateUpdateIntent,
} from '../../utils/validation.js';
import { processTransferIntent } from './processors/transfer-intent.js';

// Intent processors (Strategy pattern)
const intentProcessors = {
  transfer_intent: processTransferIntent,
};

/**
 * Create an intent
 * @param {Object} data - The intent data
 * @param {string} data.from_number - The from number
 * @returns {Promise<Object>} The created intent
 * @throws {Object} ValidationError if the input is invalid
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function createIntent(data) {
  try {
    const parsedData = createIntentSchema.parse(data);
    const intentData = {
      ...parsedData,
      client_secret: `client_secret_${parsedData.from_number}`,
    };

    console.log('Creating new intent', { data: intentData });

    const { data: createdIntentData, error } = await intentRepository.createIntent(intentData);

    if (error) {
      console.error('Error creating intent', { error });
      throw createDatabaseError('Failed to create intent');
    }

    const [result] = createdIntentData;

    console.log('Intent created successfully', { id: result.id });
    return result;
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn('Validation error in createIntent', { errors: err.errors });
      throw createValidationError(err.message);
    }
    console.error('Unexpected error in createIntent', { error: err });
    throw err;
  }
}

/**
 * Update an intent
 * @param {string} id - The intent ID
 * @param {Object} data - The update data
 * @returns {Promise<Object>} The updated intent
 * @throws {Object} ValidationError if the input is invalid
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function updateIntent(id, data) {
  try {
    console.log('Fetching intent for update', { id });
    const { data: fetchedIntent, error: fetchError } = await intentRepository.fetchIntentById(id);

    if (fetchError) {
      console.error('Error fetching intent:', fetchError);
      throw createDatabaseError('Failed to fetch intent for update');
    }

    if (fetchedIntent.length === 0) {
      console.warn('Intent not found for update', { id });
      throw createNotFoundError(`Intent with id ${id} not found`);
    }

    // validate fields to confirm intent
    const validationError = validateUpdateIntent(fetchedIntent);

    if (validationError) {
      console.error('Intent validation failed:', validationError);
      throw createValidationError(`Intent cannot be updated. ${validationError}`);
    }

    const parsedData = updateIntentSchema.parse(data);

    console.log('Updating intent', { id, data: parsedData });
    const { data: updatedData, error } = await intentRepository.updateIntent(id, parsedData);

    if (error) {
      console.error('Error updating intent', { id, error });
      throw createDatabaseError('Failed to update intent');
    }

    console.log('Intent updated successfully', { id });
    const [result] = updatedData;
    return result;
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn('Validation error in updateIntent', { id, errors: err.errors });
      throw createValidationError(err.message);
    }

    console.error('Unexpected error in updateIntent', { id, error: err });
    throw err;
  }
}

/**
 * Fetch all intents
 * @returns {Promise<Array<Object>>} All intents
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function fetchAllIntents() {
  try {
    console.log('Fetching all intents');
    const { data, error } = await intentRepository.fetchAllIntents();

    if (error) {
      console.error('Error fetching all intents', { error });
      throw createDatabaseError('Failed to fetch all intents');
    }

    console.log('All intents fetched successfully', { count: data.length });
    return data;
  } catch (err) {
    console.error('Unexpected error in fetchAllIntents', { error: err });
    throw err;
  }
}

/**
 * Fetch all intents for a user
 * @param {string} from_number - The user's phone number
 * @returns {Promise<Array<Object>>} User's intents
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function fetchAllUserIntents(from_number) {
  try {
    console.log('Fetching user intents', { from_number });
    const { data, error } = await intentRepository.fetchAllUserIntents(from_number);

    if (error) {
      console.error('Error fetching user intents', { from_number, error });
      throw createDatabaseError('Failed to fetch user intents');
    }

    console.log('User intents fetched successfully', { from_number, count: data.length });
    return data;
  } catch (err) {
    console.error('Unexpected error in fetchAllUserIntents', { from_number, error: err });
    throw err;
  }
}

/**
 * Fetch an intent by its ID
 * @param {string} id - The intent ID
 * @returns {Promise<Object>} The intent
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function fetchIntentById(id) {
  try {
    console.log('Fetching intent by ID', { id });
    const { data, error } = await intentRepository.fetchIntentById(id);

    if (error) {
      console.error('Error fetching intent', { id, error });
      throw createDatabaseError('Failed to fetch intent');
    }

    console.log('Intent fetched successfully', { id });
    const [intent] = data;

    return intent;
  } catch (err) {
    console.error('Unexpected error in fetchIntentById', { id, error: err });
    throw err;
  }
}

/**
 * Confirm an intent
 * @param {string} id - The intent ID
 * @returns {Promise<Object>} The confirmed intent
 * @throws {Object} ValidationError if the intent is not ready to be confirmed
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function confirmIntent(id) {
  try {
    await fetchAndValidateIntent(id);
    const confirmedIntent = await executeConfirmation(id);
    const processResult = await processConfirmedIntent(confirmedIntent);
    const [updatedIntent] = await updateProcessedIntent(id, processResult);

    return updatedIntent;
  } catch (err) {
    if (
      err.name !== 'ValidationError' &&
      err.name !== 'NotFoundError' &&
      err.name !== 'DatabaseError'
    ) {
      console.error('Unexpected error in confirmIntent', { id, error: err });
    }
    throw err;
  }
}

/**
 * Cancel an intent
 * @param {string} id - The intent ID
 * @returns {Promise<Object>} The cancelled intent
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function cancelIntent(id, data) {
  try {
    console.log('Fetching intent for cancellation', { id });
    const { data: intent, error: fetchError } = await intentRepository.fetchIntentById(id);

    if (fetchError) {
      console.error('Error fetching intent:', fetchError);
      throw createDatabaseError('Failed to fetch intent for cancellation');
    }

    if (intent.length === 0) {
      console.warn('Intent not found for cancellation', { id });
      throw createNotFoundError(`Intent with id ${id} not found`);
    }

    const validationError = validateCancellationIntent(intent);

    if (validationError) {
      console.error('Intent validation failed:', validationError);
      throw createValidationError(`Intent is not ready to be cancelled. ${validationError}`);
    }

    const parsedData = cancelIntentSchema.parse(data);

    console.log('Cancelling intent', { id, cancellation_reason: parsedData.cancellation_reason });
    const cancellationInfo = {
      cancelled_at: new Date(),
      cancellation_reason: parsedData.cancellation_reason,
    };
    const { data: result, error } = await intentRepository.cancelIntent(id, cancellationInfo);

    if (error) {
      console.error('Error cancelling intent', { id, error });
      throw createDatabaseError('Failed to cancel intent');
    }

    console.log('Intent cancelled successfully', { id });
    return result;
  } catch (err) {
    console.error('Unexpected error in cancelIntent', { id, error: err });
    throw err;
  }
}

/**
 * @param {object} body
 * @description Search for intents
 */
export async function searchIntents({ query }) {
  try {
    const validatedData = searchIntentSchema.parse({ query });
    console.log('Searching intents', { query });

    const { data, error } = await intentRepository.searchIntents(validatedData.query);

    if (error) {
      console.error('Error searching intents', { query, error });
      throw createDatabaseError('Failed to search intents');
    }

    console.log('Intents search completed', { query, count: data.length });
    return data;
  } catch (err) {
    console.error('Unexpected error in searchIntents', { query, error: err });
    throw err;
  }
}

/**
 * Delete an intent
 * @param {string} id - The intent ID
 * @returns {Promise<Object>} The result of the delete operation
 * @throws {Object} NotFoundError if the intent doesn't exist
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function deleteIntent(id) {
  try {
    console.log('Fetching intent to delete', { id });
    const { data: intent, error: fetchError } = await intentRepository.fetchIntentById(id);

    if (fetchError) {
      console.error('Error fetching intent:', fetchError);
      throw createDatabaseError('Failed to fetch intent to delete');
    }

    if (intent.length === 0) {
      console.warn('Intent not found to delete', { id });
      throw createNotFoundError(`Intent with id ${id} not found`);
    }

    const validationError = validateDeleteIntent(intent);

    if (validationError) {
      console.error('Intent validation failed:', validationError);
      throw createValidationError(`Intent is not ready to be deleted. ${validationError}`);
    }

    console.log('Deleting intent', { id });
    const { data, error } = await intentRepository.deleteIntent(id);

    if (error) {
      console.error('Error deleting intent', { id, error });
      throw createDatabaseError('Failed to delete intent');
    }

    console.log('Intent deleted successfully', { id });
    return data;
  } catch (err) {
    if (err.name !== 'DatabaseError') {
      console.error('Unexpected error in deleteIntent', { id, error: err });
    }
    throw err;
  }
}

/**
 * Fetch and validate an intent for confirmation
 * @param {string} id - The intent ID
 */
async function fetchAndValidateIntent(id) {
  console.log('Fetching intent for confirmation', { id });
  const { data: fetchedIntent, error: fetchError } = await intentRepository.fetchIntentById(id);

  if (fetchError) {
    console.error('Error fetching intent:', fetchError);
    throw createDatabaseError('Failed to fetch intent for confirmation');
  }

  if (fetchedIntent && fetchedIntent.length === 0) {
    console.warn('Intent not found for confirmation', { id });
    throw createNotFoundError(`Intent with id ${id} not found`);
  }

  // validate fields to confirm intent
  const validationError = validateConfirmationIntent(fetchedIntent);

  if (validationError) {
    console.error('Intent validation failed:', validationError);
    throw createValidationError(`Intent is not ready to be confirmed. ${validationError}`);
  }
}

/**
 * Confirm the intent
 * @param {string} id - The intent ID
 */
async function executeConfirmation(id) {
  console.log('Confirming intent', { id });
  const { data: confirmedData, error } = await intentRepository.confirmIntent(id, {
    confirmed_at: new Date(),
  });

  if (error) {
    console.error('Error confirming intent', { id, error });
    throw createDatabaseError('Failed to confirm intent');
  }

  console.log('Intent confirmed successfully', { id });

  const [result] = confirmedData;
  return result;
}

/**
 * Process the confirmed intent
 * @param {Object} intent - The intent to process
 *
 */
async function processConfirmedIntent(intent) {
  const processor = intentProcessors[intent.object];

  if (!processor) {
    console.warn('No processor found for intent', { id: intent.id, object: intent.object });
    return;
  }

  return await processor(intent);
}

/**
 * Update the processed intent
 * Uses the intent repository directly to update the intent as we dont need the usual validation
 * @param {string} id - The intent ID
 * @param {Object} processResult - The result of processing the intent
 */
async function updateProcessedIntent(id, processResult) {
  const parsedData = updateIntentSchema.parse(processResult);

  console.log('Updating intent', { id, data: parsedData });
  const { data: updatedData, error } = await intentRepository.updateIntent(id, parsedData);

  if (error) {
    console.error('Error updating intent', { id, error });
    throw createDatabaseError('Failed to update intent');
  }

  return updatedData;
}

/**
 * Create an intent
 */
export async function createStripeIntent(data) {
  try {
    const parsedData = createStripeIntentSchema.parse(data);
    const intentData = {
      ...parsedData,
      client_secret: `client_secret_${parsedData.from_number}`,
    };

    console.log('Creating new intent', { data: intentData });

    const { data: createdIntentData, error } = await intentRepository.createIntent(intentData);

    if (error) {
      console.error('Error creating intent', { error });
      throw createDatabaseError('Failed to create intent');
    }

    const [result] = createdIntentData;

    console.log('Intent created successfully', { id: result.id });
    return result;
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn('Validation error in createIntent', { errors: err.errors });
      throw createValidationError(err.message);
    }
    console.error('Unexpected error in createIntent', { error: err });
    throw err;
  }
}

/**
 * Fetch an intent by Transaction ID
 */
export async function fetchIntentByTransactionID(transactionId) {
  try {
    console.log('Fetching intent by transaction ID', { transactionId });

    const { data: fetchedIntent, error: fetchError } =
      await intentRepository.fetchIntentByTransactionID(transactionId);

    if (fetchError) {
      console.error('Error fetching intent:', fetchError);
      throw createDatabaseError('Failed to fetch intent by transaction ID');
    }

    if (fetchedIntent && fetchedIntent.length === 0) {
      console.warn('Intent not found by transaction ID', { transactionId });
      throw createNotFoundError(`Intent with transaction ID ${transactionId} not found`);
    }

    const [result] = fetchedIntent;
    return result;
  } catch (err) {
    console.error('Unexpected error in fetchIntentByTransactionId', { transactionId, error: err });
    throw err;
  }
}
