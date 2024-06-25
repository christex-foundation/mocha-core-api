//@ts-check

// Intents Service
import { ZodError } from 'zod';
import * as intentRepository from '../../repos/intents.mjs';
import { createIntentSchema, updateIntentSchema } from '../../schemas/intent.mjs';
import { createDatabaseError, createValidationError } from '../../utils/errors';

/**
 * Create a payment intent
 * @param {Object} data - The intent data
 * @param {string} data.from_number - The from number
 * @returns {Promise<Object>} The created intent
 * @throws {Object} ValidationError if the input is invalid
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function createIntent(data) {
  try {
    const validatedData = createIntentSchema.parse(data);
    const intentData = {
      ...validatedData,
      client_secret: `client_secret_${validatedData.from_number}`,
    };

    console.log('Creating new intent', { data: intentData });
    const {
      data: [result],
      error,
    } = await intentRepository.createIntent(intentData);

    if (error) {
      console.error('Error creating intent', { error });
      throw createDatabaseError('Failed to create intent');
    }

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
 * Update a payment intent
 * @param {string} id - The intent ID
 * @param {Object} data - The update data
 * @returns {Promise<Object>} The updated intent
 * @throws {Object} ValidationError if the input is invalid
 * @throws {Object} DatabaseError if there's an error with the database operation
 */
export async function updateIntent(id, data) {
  try {
    const validatedData = updateIntentSchema.parse(data);

    console.log('Updating intent', { id, data: validatedData });
    const {
      data: [result],
      error,
    } = await intentRepository.updateIntent(id, validatedData);

    if (error) {
      console.error('Error updating intent', { id, error });
      throw createDatabaseError('Failed to update intent');
    }

    console.log('Intent updated successfully', { id });
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
 * Fetch all payment intents
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
 * @param {string} from_number
 * @description Fetch all payment intents for a user
 */
export async function fetchAllUserIntents(from_number) {
  try {
    const { data, error } = await intentRepository.fetchAllUserIntents(from_number);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

/**
 * @param {string} id
 * @description Fetch a payment intent by its ID
 */
export async function fetchIntentById(id) {
  try {
    const { data, error } = await intentRepository.fetchIntentById(id);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

/**
 * @param {string} id
 * @param {string} from_number
 * @description Confirm a payment intent
 */
export async function confirmIntent(id, from_number) {
  try {
    const {
      // @ts-ignore
      data: [intent],
      error: fetchError,
    } = await intentRepository.fetchIntentById(id);
    if (fetchError) {
      console.error('Error fetching intent:', fetchError);
      return fetchError;
    }

    const requiredFields = ['amount', 'amount_received', 'currency', 'from_number', 'to_number'];
    const missingFields = requiredFields.filter((field) => !intent[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMessage);
      return { error: errorMessage };
    }

    const data = { confirmed_at: new Date() };

    const { data: result, error } = await intentRepository.confirmIntent(id, from_number, data);
    if (error) {
      console.error('Error updating intent:', error);
      return error;
    }
    return result;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

/**
 * @param {string} id
 * @description Cancel a payment intent
 */
export async function cancelIntent(id) {
  try {
    const data = {
      cancelled_at: new Date(),
      cancellation_reason: 'User cancelled',
    };
    const { data: result, error } = await intentRepository.cancelIntent(id, data);
    if (error) {
      console.log(error);
    }
    return result;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

/**
 * @param {string} query
 * @description Search for payment intents
 */
export async function searchIntents(query) {
  try {
    const { data, error } = await intentRepository.searchIntents(query);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

/**
 * @param {string} id
 * @description Delete a payment intent
 */
export async function deleteIntent(id) {
  try {
    const { data, error } = await intentRepository.deleteIntent(id);
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}
