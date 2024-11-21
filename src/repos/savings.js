//@ts-check

import { Transaction, VersionedMessage, VersionedTransaction } from '@solana/web3.js';
import getConnection from '../utils/connection.js';
import { MOCHA_KEYPAIR } from '../utils/solana.js';

/**
 * Fetches account details from the FlexLend API.
 * @param {string} walletAddress - The wallet address to fetch the account details for.
 * @returns {Promise<object>} The account details.
 */
export async function fetchAccountDetails(walletAddress) {
  try {
    const response = await fetch('https://api.flexlend.fi/account', {
      method: 'GET',
      headers: {
        'x-wallet-pubkey': walletAddress,
        'x-api-key': process.env.LULO_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching account details:', error.message);
    throw error;
  }
}

/**
 * Generates a deposit transaction for the savings account using the FlexLend API.
 * @param {Object} depositParams - Deposit parameters
 * @param {string} depositParams.owner - The wallet address of the account owner.
 * @param {string} depositParams.mintAddress - The mint address of the token to deposit.
 * @param {string} depositParams.depositAmount - The amount to deposit as a string.
 * @returns {Promise<object>} The deposit transaction details.
 */
export async function fetchDepositTransaction({ owner, mintAddress, depositAmount }) {
  return await fetch('https://api.flexlend.fi/generate/account/deposit?priorityFee=5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-pubkey': owner,
      'x-api-key': process.env.LULO_API_KEY,
    },
    body: JSON.stringify({
      owner,
      mintAddress,
      depositAmount,
    }),
  });
}

/**
 * Makes a deposit into the user's savings account.
 * @param {string} transaction - The transaction to make the deposit with.
 * @returns {Promise<string>} The signature of the deposit transaction.
 */
export async function makeDeposit(transaction) {
  console.log('\nMaking Deposit..');

  const rawTransaction = Buffer.from(transaction, 'base64');
  const tx = VersionedTransaction.deserialize(rawTransaction);

  console.log('🚀 ~ makeDeposit ~ tx1:', tx);
  console.log('Signing transaction w/:', MOCHA_KEYPAIR.publicKey.toBase58());
  console.log('🚀 ~ makeDeposit ~ tx2:', tx.signatures);
  console.log('Sending signed transaction...');

  tx.sign([MOCHA_KEYPAIR]);

  const connection = getConnection();
  return await connection.sendTransaction(tx);
}
