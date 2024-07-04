// @ts-check

import { transfer } from '../transfer.js';
import { cancelIntent } from '../intents.js';
import { createOnChainError } from '../../../utils/errors.js';

/**
 * @description Function to process transfer intent
 * @param {Object} intent
 * @param {string} intent.id
 * @param {number} intent.amount
 * @param {string} intent.from_number
 * @param {string} intent.to_number
 */
export async function processTransferIntent(intent) {
  if (intent.amount > 0 && intent.from_number && intent.to_number) {
    try {
      console.log('Executing transfer for confirmed intent', { id: intent.id });
      const transactionId = await transfer(intent);

      console.log('Transfer executed successfully', { id: intent.id, transactionId });
      return {
        transaction_id: transactionId,
        payment_method: 'onchain',
        amount_received: intent.amount,
      };
    } catch (transferError) {
      console.error('Transfer failed for confirmed intent', {
        id: intent.id,
        error: transferError,
      });

      await cancelIntent(intent.id, {
        cancellation_reason: `Transfer failed: ${transferError.message}`,
      });
      throw createOnChainError('Intent confirmed but transfer failed. Intent has been cancelled.');
    }
  } else {
    return { status: 'unprocessed', message: 'Invalid transfer parameters' };
  }
}
