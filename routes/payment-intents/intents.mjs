//@ts-check
// Intents Service

import * as intentRepository from '../../repo/intents.mjs';

export async function createIntent(from_number) {
  try {
    const data = {
      from_number: from_number,
      client_secret: `client_secret_${from_number}`,
    };
    const { data: result, error } = await intentRepository.createIntent(data);
    if (error) {
      console.log(error);
    }
    return result;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function updateIntent(
  id,
  from_number,
  to_number,
  amount,
  currency,
  description,
  cancelation_reason,
  payment_method,
  amount_received,
) {
  try {
    const data = {
      from_number: from_number,
      to_number: to_number,
      amount: amount,
      currency: currency,
      description: description,
      cancelation_reason: cancelation_reason,
      payment_method: payment_method,
      amount_received: amount_received,
    };
    const { data: result, error } = await intentRepository.updateIntent(id, data);
    if (error) {
      console.log(error);
    }
    return result;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

export async function fetchAllIntents() {
  try {
    const { data, error } = await intentRepository.fetchAllIntents();
    if (error) {
      console.log(error);
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return err;
  }
}

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

export async function confirmIntent(id, from_number) {
  try {
    const { data: intent, error: fetchError } = await intentRepository.fetchIntentById(id);
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
