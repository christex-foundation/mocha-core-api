//@ts-check
import getConnection from '../utils/connection.js';
import { createInitializeAccount3Instruction, getAccount } from '@solana/spl-token';
import { Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createAccountWithSeed } from '../utils/solana.js';

// Connect to the cluster
const connection = getConnection();
// @ts-ignore
const USDC_MINT = new PublicKey(process.env.USDC_MINT);

/**
 * @description Function to get the user token account
 * @param {PublicKey} address
 */
export async function getUserTokenAccount(address) {
  return await getAccount(connection, address, 'processed');
}

/**
 * @description Function to create a user token account
 * @param {Keypair} owner
 * @param {PublicKey} address
 * @param {string} phoneNumber
 */
export async function createUserTokenAccount(owner, address, phoneNumber) {
  const accountWithSeedIx = createAccountWithSeed(owner.publicKey, phoneNumber, address);
  const initiailizeAccountIx = createInitializeAccount3Instruction(
    address,
    USDC_MINT,
    owner.publicKey,
  );

  const tx = new Transaction().add(accountWithSeedIx, initiailizeAccountIx);
  await sendAndConfirmTransaction(connection, tx, [owner], {
    skipPreflight: true,
    commitment: 'processed',
  });

  return await this.getUserTokenAccount(address);
}

/**
 * @description Function to get the token account balance
 * @param {PublicKey} address
 */
export async function getTokenAccountBalance(address) {
  return await connection.getTokenAccountBalance(address, 'processed');
}
