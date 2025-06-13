//@ts-check

import * as walletRepository from "../../repos/wallets.js";
import { createNotFoundError } from "../../utils/errors.js";
import { MOCHA_KEYPAIR, deriveAddress } from "../../utils/solana.js";

/**
 * @description Function to fetch the wallet balance
 * @param {string} phoneNumber
 */
export async function fetchWalletBalance(phoneNumber) {
	const addressPk = await deriveAddress(MOCHA_KEYPAIR.publicKey, phoneNumber);

	try {
		const balance = await walletRepository.getTokenAccountBalance(addressPk);
		return {
			address: addressPk.toBase58(),
			balance: balance?.value?.uiAmount?.toFixed(2),
		};
	} catch (error) {
		console.error("Error fething balance; Token account not found", {
			error,
			phoneNumber,
			address: addressPk.toBase58(),
		});

		return 0;
	}
}
