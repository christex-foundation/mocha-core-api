//@ts-check
import { jest } from '@jest/globals';

// Mock the repository
jest.unstable_mockModule('../src/repos/wallets.js', () => ({
  getTokenAccountBalance: jest.fn(),
}));

// Mock the connection module
jest.unstable_mockModule('../src/utils/connection.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Wallet Service', () => {
  let walletService;
  let walletRepository;

  beforeAll(async () => {
    process.env.MOCHA_SECRET_KEY = JSON.stringify([
      53, 201, 119, 247, 223, 186, 126, 13, 31, 14, 50, 96, 251, 159, 21, 155, 249, 40, 128, 85, 46,
      156, 6, 64, 17, 17, 74, 37, 56, 80, 226, 206, 100, 99, 69, 231, 207, 185, 17, 82, 139, 87, 28,
      234, 238, 97, 70, 217, 6, 239, 5, 106, 5, 43, 31, 105, 96, 109, 246, 151, 159, 112, 154, 196,
    ]);

    walletService = await import('../src/routes/wallet/wallet.js');
    walletRepository = await import('../src/repos/wallets.js');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('fetchWalletBalance', () => {
    it('should fetch wallet balance successfully', async () => {
      const mockPhoneNumber = '1234567890';
      const mockBalance = { value: { uiAmount: 100.5 } };

      walletRepository.getTokenAccountBalance.mockResolvedValue(mockBalance);

      const result = await walletService.fetchWalletBalance(mockPhoneNumber);

      expect(result).toBe('100.50');
      expect(walletRepository.getTokenAccountBalance).toHaveBeenCalled();
    });

    it('should return undefined if value is undefined', async () => {
      const mockPhoneNumber = '1234567890';
      const mockBalance = { value: undefined };
      walletRepository.getTokenAccountBalance.mockResolvedValue(mockBalance);

      const result = await walletService.fetchWalletBalance(mockPhoneNumber);

      expect(result).toBeUndefined();
    });

    it('should throw an error when getTokenAccountBalance fails', async () => {
      const mockPhoneNumber = '1234567890';
      walletRepository.getTokenAccountBalance.mockRejectedValue(new Error('Wallet not found'));

      await expect(walletService.fetchWalletBalance(mockPhoneNumber)).rejects.toThrow(
        'Wallet not found',
      );
    });
  });
});
