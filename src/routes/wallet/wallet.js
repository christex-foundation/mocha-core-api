//@ts-check

import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as walletRepository from '../../repos/wallets.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { createNotFoundError } from '../../utils/errors.js';

const MOCHA_KEYPAIR = Keypair.fromSecretKey(
  // @ts-ignore
  Uint8Array.from(JSON.parse(process.env.MOCHA_SECRET_KEY)),
);

/**
 * @description Function to fetch the wallet balance
 * @param {string} phoneNumber
 */
export async function getOrCreateUserTokenAccount(phoneNumber) {
  const address = await deriveAddress(phoneNumber);

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
  const addressPk = await deriveAddress(phoneNumber);

  try {
    const balance = await walletRepository.getTokenAccountBalance(addressPk);
    return balance?.value?.uiAmount?.toFixed(2);
  } catch (error) {
    console.error('Error fething balance', { error, phoneNumber, address: addressPk.toBase58() });
    throw createNotFoundError('Wallet not found');
  }
}

/**
 * @description Function to derive the wallet address from the phone number
 * @param {string} phoneNumber
 */
async function deriveAddress(phoneNumber) {
  return PublicKey.createWithSeed(MOCHA_KEYPAIR.publicKey, phoneNumber, TOKEN_PROGRAM_ID);
}
