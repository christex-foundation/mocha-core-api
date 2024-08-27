//@ts-check
import { fetchAccountDetails } from '../../repos/savings.js';
import { deriveAddress, MOCHA_KEYPAIR } from '../../utils/solana.js';

export async function fetchSavings(uid) {
  const walletAddress = await deriveAddress(MOCHA_KEYPAIR.publicKey, uid);
  const accountDetails = await fetchAccountDetails(walletAddress.toBase58());
  return { accountDetails };
}
