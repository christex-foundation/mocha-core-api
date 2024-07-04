//@ts-check
import BigNumber from 'bignumber.js';
import { createUserTokenAccount, getUserTokenAccount, transferUSDC } from '../../repos/transfer.js';
import { MOCHA_KEYPAIR, deriveAddress } from '../../utils/solana.js';
import { createOnChainError } from '../../utils/errors.js';

/**
 * @param {string} fromNumber
 * @param {string} toNumber
 * @param {number} amount
 * @returns {Promise<string>}
 */
export async function transfer(fromNumber, toNumber, amount) {
  // run validation
  // TODO: validate numbers
  // https://twilio.com/docs/lookup/quickstart
  //https://www.twilio.com/docs/glossary/what-e164
  console.log(`Transferrring USDC`, amount);

  const fromWhatsappUserAccount = await getOrCreateUserTokenAccount(fromNumber);
  const toWhatsappUserAccount = await getOrCreateUserTokenAccount(toNumber);

  // fix amount
  let parsedAmount = new BigNumber(amount).multipliedBy(10 ** 6).toNumber();

  // call transfer
  try {
    const txSig = await transferUSDC(
      MOCHA_KEYPAIR,
      fromWhatsappUserAccount,
      toWhatsappUserAccount,
      parsedAmount,
    );

    return txSig;
  } catch (error) {
    console.error('Error transferring USDC', { fromNumber, toNumber, amount, error });
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
