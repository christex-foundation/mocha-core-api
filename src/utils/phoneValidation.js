//@ts-check

import { createTwilioClient } from './twilio.js';
import { createPhoneValidationError } from './errors.js';

/**
 * @description Validate a phone number
 * @param {string|number} phoneNumber - The phone number to validate
 * @returns {Promise<{phoneNumber: string, countryCode: string, nationalFormat: string}>} The validated phone number
 */
export async function validatePhoneNumber(phoneNumber) {
  try {
    const client = createTwilioClient();
    const number = await client.lookups.v2.phoneNumbers(phoneNumber).fetch();

    if (number.valid) {
      return {
        phoneNumber: number.phoneNumber,
        countryCode: number.countryCode,
        nationalFormat: number.nationalFormat,
      };
    } else {
      throw createPhoneValidationError(phoneNumber);
    }
  } catch (error) {
    console.error('Error validating phone number:', error.message);
    throw error;
  }
}
