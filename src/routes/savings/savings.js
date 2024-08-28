//@ts-check
import { fetchAccountDetails, fetchDepositTransaction, makeDeposit } from '../../repos/savings.js';
import { deriveAddress, MOCHA_KEYPAIR } from '../../utils/solana.js';

export async function fetchSavings(uid) {
  const walletAddress = await deriveAddress(MOCHA_KEYPAIR.publicKey, uid);
  const accountDetails = await fetchAccountDetails(walletAddress.toBase58());
  return { accountDetails };
}

/**
 * Makes a deposit into the user's savings account.
 * @param {string} uid - The user's unique identifier.
 * @param {string} depositAmount - The amount to deposit as a string.
 * @returns {Promise<object>} The deposit transaction details.
 */
export async function makeSavingsDeposit(uid, depositAmount) {
  console.log('\nMake Savings Deposit', { uid, depositAmount });
  const walletAddress = await deriveAddress(MOCHA_KEYPAIR.publicKey, uid);

  try {
    console.log(
      '\nFetching Deposit Transaction from LULO:',
      '\nWallet Address:',
      walletAddress.toBase58(),
      '\nMint Address: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      '\nDeposit Amount:',
      depositAmount,
    );

    const response = await fetchDepositTransaction({
      owner: walletAddress.toBase58(),
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      depositAmount,
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    const {
      data: {
        transactionMeta: [{ transaction, totalDeposit }],
      },
    } = await response.json();

    const sig = await makeDeposit(transaction);

    return { sig, totalDeposit };
  } catch (error) {
    console.log(error.getLogs());
    console.error('Error generating deposit transaction:', error);

    throw error;
  }
}
