import { Connection } from '@solana/web3.js';

export default function getConnection() {
  return new Connection(`https://mainnet.helius-rpc.com?api-key=${process.env.HELIUS_API_KEY}`);
}
