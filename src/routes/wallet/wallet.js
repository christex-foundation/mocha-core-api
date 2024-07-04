//@ts-check

import * as walletRepository from '../../repos/wallets.js';
import { createNotFoundError } from '../../utils/errors.js';
import { deriveAddress, MOCHA_KEYPAIR } from '../../utils/solana.js';

/**
 * @description Function to fetch the wallet balance
 * @param {string} phoneNumber
 */
export async function getOrCreateUserTokenAccount(phoneNumber) {
  const address = await deriveAddress(MOCHA_KEYPAIR.publicKey, phoneNumber);

  try {
    const account = await walletRepository.getUserTokenAccount(address);
    return account.address;
  } catch (error) {
    const newAccount = await walletRepository.createUserTokenAccount(
      MOCHA_KEYPAIR,
      address,
      phoneNumber,
    );
    return newAccount.address;
  }
}

/**
 * @description Function to fetch the wallet balance
 * @param {string} phoneNumber
 */
export async function fetchWalletBalance(phoneNumber) {
  const addressPk = await deriveAddress(MOCHA_KEYPAIR.publicKey, phoneNumber);

  try {
    const balance = await walletRepository.getTokenAccountBalance(addressPk);
    return balance?.value?.uiAmount?.toFixed(2);
  } catch (error) {
    console.error('Error fething balance', { error, phoneNumber, address: addressPk.toBase58() });
    throw createNotFoundError('Wallet not found');
  }
}
