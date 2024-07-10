//@ts-check
import { jest } from '@jest/globals';
import { Keypair, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

// Mock the repository
jest.unstable_mockModule('../src/repos/transfer.js', () => ({
  createUserTokenAccount: jest.fn(),
  getUserTokenAccount: jest.fn(),
  transferUSDC: jest.fn(),
}));

// Mock the solana utils
jest.unstable_mockModule('../src/utils/solana.js', () => ({
  MOCHA_KEYPAIR: Keypair.fromSecretKey(
    Uint8Array.from([
      53, 201, 119, 247, 223, 186, 126, 13, 31, 14, 50, 96, 251, 159, 21, 155, 249, 40, 128, 85, 46,
      156, 6, 64, 17, 17, 74, 37, 56, 80, 226, 206, 100, 99, 69, 231, 207, 185, 17, 82, 139, 87, 28,
      234, 238, 97, 70, 217, 6, 239, 5, 106, 5, 43, 31, 105, 96, 109, 246, 151, 159, 112, 154, 196,
    ]),
  ),
  deriveAddress: jest.fn(),
}));

describe('Transfer Service', () => {
  let transferService;
  let transferRepo;
  let solanaUtils;

  beforeAll(async () => {
    transferService = await import('../src/routes/intents/transfer.js');
    transferRepo = await import('../src/repos/transfer.js');
    solanaUtils = await import('../src/utils/solana.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transfer', () => {
    it('should transfer USDC successfully', async () => {
      const fromNumber = '1234567890';
      const toNumber = '0987654321';
      const amount = 100;
      const mockFromAddress = Keypair.generate().publicKey;
      const mockToAddress = Keypair.generate().publicKey;
      const mockTxId = 'mocktransactionid';

      solanaUtils.deriveAddress
        .mockResolvedValueOnce(mockFromAddress)
        .mockResolvedValueOnce(mockToAddress);
      transferRepo.getUserTokenAccount.mockResolvedValueOnce({ address: mockFromAddress });
      transferRepo.getUserTokenAccount.mockResolvedValueOnce({ address: mockToAddress });
      transferRepo.transferUSDC.mockResolvedValue(mockTxId);

      const result = await transferService.transfer({
        from_number: fromNumber,
        to_number: toNumber,
        amount,
      });

      expect(result).toBe(mockTxId);
      expect(transferRepo.transferUSDC).toHaveBeenCalledWith(
        solanaUtils.MOCHA_KEYPAIR,
        mockFromAddress,
        mockToAddress,
        new BigNumber(amount).multipliedBy(10 ** 6).toNumber(),
      );
    });

    it('should create a new account if it does not exist', async () => {
      const fromNumber = '1234567890';
      const toNumber = '0987654321';
      const amount = 100;
      const mockFromAddress = Keypair.generate().publicKey;
      const mockToAddress = Keypair.generate().publicKey;
      const mockTxId = 'mocktransactionid';

      solanaUtils.deriveAddress
        .mockResolvedValueOnce(mockFromAddress)
        .mockResolvedValueOnce(mockToAddress);
      transferRepo.getUserTokenAccount.mockRejectedValueOnce(new Error('Account not found'));
      transferRepo.createUserTokenAccount.mockResolvedValue({ address: mockToAddress });
      transferRepo.transferUSDC.mockResolvedValue(mockTxId);

      const result = await transferService.transfer({
        from_number: fromNumber,
        to_number: toNumber,
        amount,
      });

      expect(result).toBe(mockTxId);
      expect(transferRepo.createUserTokenAccount).toHaveBeenCalledWith(
        solanaUtils.MOCHA_KEYPAIR,
        mockToAddress,
        toNumber,
      );
    });

    it('should throw an error if transfer fails', async () => {
      const fromNumber = '1234567890';
      const toNumber = '0987654321';
      const amount = 100;
      const mockFromAddress = Keypair.generate().publicKey;
      const mockToAddress = Keypair.generate().publicKey;

      solanaUtils.deriveAddress
        .mockResolvedValueOnce(mockFromAddress)
        .mockResolvedValueOnce(mockToAddress);
      transferRepo.getUserTokenAccount.mockResolvedValue({ address: mockFromAddress });
      transferRepo.transferUSDC.mockRejectedValue(new Error('Error transferring USDC'));

      await expect(
        transferService.transfer({ from_number: fromNumber, to_number: toNumber, amount }),
      ).rejects.toThrow('Error transferring USDC');
    });
  });
});
