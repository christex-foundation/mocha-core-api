//@ts-check
import getConnection from '../utils/connection.js';
import { PublicKey } from '@solana/web3.js';

// Connect to the cluster
const connection = getConnection();

/**
 * @description Function to get the token account balance
 * @param {PublicKey} address
 */
export async function getTokenAccountBalance(address) {
  return await connection.getTokenAccountBalance(address, 'processed');
}
