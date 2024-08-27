//@ts-check

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
