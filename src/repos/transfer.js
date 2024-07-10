//@ts-check
import { createInitializeAccount3Instruction, getAccount, transfer } from '@solana/spl-token';
import getConnection from '../utils/connection.js';
import { Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createAccountWithSeed } from '../utils/solana.js';

// @ts-ignore
const USDC_MINT = new PublicKey(process.env.USDC_MINT);
const connection = getConnection();

/**
 * @description Function to transfer USDC tokens
 * @param {Keypair} owner
 * @param {PublicKey} fromWhatsappUserAccount
 * @param {PublicKey} toWhatsappUserAccount
 * @param {number} amount
 */
export async function transferUSDC(owner, fromWhatsappUserAccount, toWhatsappUserAccount, amount) {
  return await transfer(
    connection,
    owner,
    fromWhatsappUserAccount,
    toWhatsappUserAccount,
    owner,
    amount,
    undefined,
    {
      skipPreflight: true,
      commitment: 'processed',
    },
  );
}

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

  return await getUserTokenAccount(address);
}
