//@ts-check

import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';

/** @internal */
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/**
 * @description Add a memo to a transaction
 * @param {string} memo
 * @returns {TransactionInstruction}
 */
export function addMemo(memo) {
  return new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(memo, 'utf8'),
  });
}

/**
 * @param {PublicKey} basePubKey
 * @param {string} seed
 * @param {PublicKey} newAccountPubkey
 */
export function createAccountWithSeed(basePubKey, seed, newAccountPubkey) {
  const ix = SystemProgram.createAccountWithSeed({
    fromPubkey: basePubKey,
    basePubkey: basePubKey,
    seed,
    newAccountPubkey,
    lamports: LAMPORTS_PER_SOL,
    space: 165,
    programId: TOKEN_PROGRAM_ID,
  });

  return ix;
}
/**
 * @description Function to derive the wallet address from the phone number
 * @param {PublicKey} owner
 * @param {string} phoneNumber
 */
export async function deriveAddress(owner, phoneNumber) {
  return PublicKey.createWithSeed(owner, phoneNumber, TOKEN_PROGRAM_ID);
}

// Mocha keypair
export const MOCHA_KEYPAIR = Keypair.fromSecretKey(
  // @ts-ignore
  Uint8Array.from(JSON.parse(process.env.MOCHA_SECRET_KEY)),
);
