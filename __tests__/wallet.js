import { jest } from '@jest/globals';
import { Keypair } from '@solana/web3.js';

const mockGetTokenAccountBalance = jest.fn();
const mockConnection = {
  getTokenAccountBalance: mockGetTokenAccountBalance,
};

const mockGetOrCreateUserTokenAccount = jest.fn();

// Mock the connection module
jest.unstable_mockModule('../src/utils/connection.js', () => ({
  __esModule: true,
  default: jest.fn(() => mockConnection),
}));

// Mock the wallet utility
jest.unstable_mockModule('../src/utils/wallet.js', () => ({
  getOrCreateUserTokenAccount: mockGetOrCreateUserTokenAccount,
}));

describe('Wallet Service', () => {
  let walletService;

  beforeAll(() => {
    process.env.MOCHA_SECRET_KEY = JSON.stringify([
      53, 201, 119, 247, 223, 186, 126, 13, 31, 14, 50, 96, 251, 159, 21, 155, 249, 40, 128, 85, 46,
      156, 6, 64, 17, 17, 74, 37, 56, 80, 226, 206, 100, 99, 69, 231, 207, 185, 17, 82, 139, 87, 28,
      234, 238, 97, 70, 217, 6, 239, 5, 106, 5, 43, 31, 105, 96, 109, 246, 151, 159, 112, 154, 196,
    ]); // Mock secret key
    process.env.HELIUS_URL = 'https://mock-helius-url.com';
    process.env.HELIUS_API_KEY = 'mock-api-key';
    process.env.USDC_MINT = Keypair.generate().publicKey.toString();
  });

  beforeEach(async () => {
    jest.resetModules();
    walletService = await import('../src/routes/wallet/wallet.js');
  });

  describe('fetchWalletBalance', () => {
    it('should fetch wallet balance successfully', async () => {
      const mockPhoneNumber = '1234567890';
      const mockAddress = 'wallet_address_123';
      const mockBalance = { value: { uiAmount: 100.5 } };

      mockGetOrCreateUserTokenAccount.mockResolvedValue(mockAddress);
      mockGetTokenAccountBalance.mockResolvedValue(mockBalance);

      const result = await walletService.fetchWalletBalance(mockPhoneNumber);

      expect(result).toBe('100.50');
      expect(mockGetOrCreateUserTokenAccount).toHaveBeenCalled();
      expect(mockGetTokenAccountBalance).toHaveBeenCalledWith(mockAddress, 'processed');
    });

    it('should return undefined when uiAmount is undefined', async () => {
      const mockPhoneNumber = '1234567890';
      const mockAddress = 'wallet_address_123';
      const mockBalance = { value: { uiAmount: undefined } };

      mockGetOrCreateUserTokenAccount.mockResolvedValue(mockAddress);
      mockGetTokenAccountBalance.mockResolvedValue(mockBalance);

      const result = await walletService.fetchWalletBalance(mockPhoneNumber);

      expect(result).toBeUndefined();
    });

    it('should throw an error when getOrCreateUserTokenAccount fails', async () => {
      const mockPhoneNumber = '1234567890';
      mockGetOrCreateUserTokenAccount.mockRejectedValue(new Error('Failed to get account'));

      await expect(walletService.fetchWalletBalance(mockPhoneNumber)).rejects.toThrow(
        'Failed to get account',
      );
    });

    it('should throw an error when getTokenAccountBalance fails', async () => {
      const mockPhoneNumber = '1234567890';
      const mockAddress = 'wallet_address_123';

      mockGetOrCreateUserTokenAccount.mockResolvedValue(mockAddress);
      mockGetTokenAccountBalance.mockRejectedValue(new Error('Failed to get balance'));

      await expect(walletService.fetchWalletBalance(mockPhoneNumber)).rejects.toThrow(
        'Failed to get balance',
      );
    });
  });
});
