//@ts-check
import BigNumber from 'bignumber.js';
import { createUserTokenAccount, getUserTokenAccount, transferUSDC } from '../../repos/transfer.js';
import { MOCHA_KEYPAIR, deriveAddress } from '../../utils/solana.js';
import { createOnChainError } from '../../utils/errors.js';
import { createTransferSchema } from '../../schemas/transfer.js';

/**
 * @description Function to transfer USDC tokens
 * @param {Object} body
 * @param {string} body.fromNumber
 * @param {string} body.toNumber
 * @param {number} body.amount
 */
export async function transfer(data) {
  try {
    const {
      from_number: fromNumber,
      to_number: toNumber,
      amount,
    } = createTransferSchema.parse(data);
    // TODO: validate numbers
    // https://twilio.com/docs/lookup/quickstart
    //https://www.twilio.com/docs/glossary/what-e164

    const fromWhatsappUserAccount = await getOrCreateUserTokenAccount(fromNumber.toString());
    const toWhatsappUserAccount = await getOrCreateUserTokenAccount(toNumber.toString());

    const amountInUSDC = new BigNumber(amount).dividedBy(100);
    const parsedAmount = amountInUSDC.multipliedBy(10 ** 6).toNumber();

    const transactionId = await transferUSDC(
      MOCHA_KEYPAIR,
      fromWhatsappUserAccount,
      toWhatsappUserAccount,
      parsedAmount,
    );

    return transactionId;
  } catch (error) {
    console.error('Error transferring USDC', {
      fromNumber: data.from_number,
      toNumber: data.to_number,
      amount: data.amount,
      error,
    });
    throw createOnChainError('Error transferring USDC');
  }
}

/**
 * @description Function to fetch the wallet balance
 * @param {string} phoneNumber
 */
async function getOrCreateUserTokenAccount(phoneNumber) {
  const address = await deriveAddress(MOCHA_KEYPAIR.publicKey, phoneNumber);

  try {
    const account = await getUserTokenAccount(address);
    console.log('Account found', account.address.toBase58());

    return account.address;
  } catch (error) {
    console.log('Account not found, creating account ...', {
      phoneNumber,
      address: address.toBase58(),
    });

    const newAccount = await createUserTokenAccount(MOCHA_KEYPAIR, address, phoneNumber);
    return newAccount.address;
  }
}
