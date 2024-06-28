//@ts-check
import { jest } from '@jest/globals';
import { object } from 'zod';

// Mock the repository
jest.unstable_mockModule('../src/repos/intents.mjs', () => ({
  createIntent: jest.fn(),
  updateIntent: jest.fn(),
  fetchAllIntents: jest.fn(),
  fetchAllUserIntents: jest.fn(),
  fetchIntentById: jest.fn(),
  confirmIntent: jest.fn(),
  cancelIntent: jest.fn(),
  searchIntents: jest.fn(),
  deleteIntent: jest.fn(),
}));

// Mock the supabase client
jest.unstable_mockModule('../src/utils/supabase.mjs', () => ({
  createSupabaseClient: jest.fn(),
}));

describe('Intents Service', () => {
  let intentService;
  let intentRepository;

  beforeAll(async () => {
    intentService = await import('../src/routes/intents/intents.mjs');
    intentRepository = await import('../src/repos/intents.mjs');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createIntent', () => {
    it('should create an intent successfully', async () => {
      const mockData = { from_number: '1234567890', object: 'transfer_intent' };
      const mockResult = { id: 'intent_123', ...mockData };
      intentRepository.createIntent.mockResolvedValue({ data: [mockResult], error: null });

      const result = await intentService.createIntent(mockData);
      expect(result).toEqual(mockResult);
      expect(intentRepository.createIntent).toHaveBeenCalledWith(expect.objectContaining(mockData));
    });

    it('should throw ValidationError for invalid input', async () => {
      const mockData = { from_number: 12345 }; // Invalid: should be a string
      await expect(intentService.createIntent(mockData)).rejects.toThrow();
    });

    it('should throw DatabaseError when repository fails', async () => {
      const mockData = { from_number: '1234567890', object: 'transfer_intent' };
      intentRepository.createIntent.mockResolvedValue({ data: null, error: new Error('DB Error') });

      await expect(intentService.createIntent(mockData)).rejects.toThrow('Failed to create intent');
    });
  });

  describe('updateIntent', () => {
    it('should update an intent successfully', async () => {
      const mockId = 'intent_123';
      const mockData = { amount: 1000 };
      const mockResult = { id: mockId, ...mockData };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [{ id: mockId }], error: null });
      intentRepository.updateIntent.mockResolvedValue({ data: [mockResult], error: null });

      const result = await intentService.updateIntent(mockId, mockData);
      expect(result).toEqual(mockResult);
      expect(intentRepository.updateIntent).toHaveBeenCalledWith(mockId, mockData);
    });

    it('should update an intent successfully by coercing a string amount', async () => {
      const mockId = 'intent_123';
      const mockData = { amount: '1,000' };
      const parsedMockData = { amount: 1000 };
      const mockResult = { id: mockId, ...parsedMockData };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [{ id: mockId }], error: null });
      intentRepository.updateIntent.mockResolvedValue({ data: [mockResult], error: null });

      const result = await intentService.updateIntent(mockId, mockData);
      expect(result).toEqual(mockResult);
      expect(intentRepository.updateIntent).toHaveBeenCalledWith(mockId, parsedMockData);
    });

    it('should update an intent with transaction details successfully', async () => {
      const mockId = 'intent_123';
      const mockData = { amount: 1000, amount_received: 1000, transaction_id: 'txn_123' };
      const mockResult = { id: mockId, ...mockData };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [{ id: mockId }], error: null });
      intentRepository.updateIntent.mockResolvedValue({ data: [mockResult], error: null });

      const result = await intentService.updateIntent(mockId, mockData);
      expect(result).toEqual(mockResult);
      expect(intentRepository.updateIntent).toHaveBeenCalledWith(mockId, mockData);
    });

    it('should throw NotFoundError when intent does not exist', async () => {
      const mockId = 'non_existent_id';
      intentRepository.fetchIntentById.mockResolvedValue({ data: [], error: null });

      await expect(intentService.updateIntent(mockId, {})).rejects.toThrow(
        `Intent with id ${mockId} not found`,
      );
    });

    it('should throw ValidationError for invalid input', async () => {
      const mockId = 'intent_123';
      const mockData = { amount: 'invalid' }; // Invalid: should be a number
      intentRepository.fetchIntentById.mockResolvedValue({ data: [{ id: mockId }], error: null });

      await expect(intentService.updateIntent(mockId, mockData)).rejects.toThrow();
    });

    it('should throw ValidationError when intent cannot be updated', async () => {
      const mockId = 'intent_123';
      const mockData = { amount: 1000 };
      intentRepository.fetchIntentById.mockResolvedValue({
        data: [{ id: mockId, cancelled_at: new Date() }],
        error: null,
      });

      await expect(intentService.updateIntent(mockId, mockData)).rejects.toThrow(
        'Intent cannot be updated',
      );
    });
  });

  describe('fetchAllIntents', () => {
    it('should fetch all intents successfully', async () => {
      const mockIntents = [{ id: 'intent_1' }, { id: 'intent_2' }];
      intentRepository.fetchAllIntents.mockResolvedValue({ data: mockIntents, error: null });

      const result = await intentService.fetchAllIntents();
      expect(result).toEqual(mockIntents);
    });

    it('should throw DatabaseError when repository fails', async () => {
      intentRepository.fetchAllIntents.mockResolvedValue({
        data: null,
        error: new Error('DB Error'),
      });

      await expect(intentService.fetchAllIntents()).rejects.toThrow('Failed to fetch all intents');
    });
  });

  describe('fetchAllUserIntents', () => {
    it('should fetch all user intents successfully', async () => {
      const mockFromNumber = '1234567890';
      const mockIntents = [{ id: 'intent_1', from_number: mockFromNumber }];
      intentRepository.fetchAllUserIntents.mockResolvedValue({ data: mockIntents, error: null });

      const result = await intentService.fetchAllUserIntents(mockFromNumber);
      expect(result).toEqual(mockIntents);
      expect(intentRepository.fetchAllUserIntents).toHaveBeenCalledWith(mockFromNumber);
    });

    it('should throw DatabaseError when repository fails', async () => {
      const mockFromNumber = '1234567890';
      intentRepository.fetchAllUserIntents.mockResolvedValue({
        data: null,
        error: new Error('DB Error'),
      });

      await expect(intentService.fetchAllUserIntents(mockFromNumber)).rejects.toThrow(
        'Failed to fetch user intents',
      );
    });
  });

  describe('fetchIntentById', () => {
    it('should fetch an intent by ID successfully', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });

      const result = await intentService.fetchIntentById(mockId);
      expect(result).toEqual(mockIntent);
      expect(intentRepository.fetchIntentById).toHaveBeenCalledWith(mockId);
    });

    it('should throw DatabaseError when repository fails', async () => {
      const mockId = 'intent_123';
      intentRepository.fetchIntentById.mockResolvedValue({
        data: null,
        error: new Error('DB Error'),
      });

      await expect(intentService.fetchIntentById(mockId)).rejects.toThrow('Failed to fetch intent');
    });
  });

  describe('confirmIntent', () => {
    it('should confirm an intent successfully', async () => {
      const mockId = 'intent_123';
      const mockIntent = {
        id: mockId,
        status: 'pending',
        amount: 1000,
        amount_received: 1000,
        currency: 'USD',
        from_number: '1234567890',
        to_number: '0987654321',
      };
      const confirmedIntent = {
        ...mockIntent,
        status: 'confirmed',
        confirmed_at: expect.any(Date),
      };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });
      intentRepository.confirmIntent.mockResolvedValue({ data: [confirmedIntent], error: null });

      const result = await intentService.confirmIntent(mockId);
      expect(result).toEqual(confirmedIntent);
      expect(intentRepository.confirmIntent).toHaveBeenCalledWith(mockId, expect.any(Object));
    });

    it('should throw NotFoundError when intent does not exist', async () => {
      const mockId = 'non_existent_id';
      intentRepository.fetchIntentById.mockResolvedValue({ data: [], error: null });

      await expect(intentService.confirmIntent(mockId)).rejects.toThrow(
        `Intent with id ${mockId} not found`,
      );
    });

    it('should throw ValidationError when intent is not ready to be confirmed', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId }; // Missing required fields
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });

      await expect(intentService.confirmIntent(mockId)).rejects.toThrow(
        'Intent is not ready to be confirmed',
      );
    });
  });

  describe('cancelIntent', () => {
    it('should cancel an intent successfully', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId };
      const mockData = { cancellation_reason: 'Test reason' };
      const cancelledIntent = {
        ...mockIntent,
        ...mockData,
        cancelled_at: expect.any(Date),
      };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });
      intentRepository.cancelIntent.mockResolvedValue({ data: [cancelledIntent], error: null });

      const result = await intentService.cancelIntent(mockId, mockData);
      expect(result).toEqual([cancelledIntent]);
      expect(intentRepository.cancelIntent).toHaveBeenCalledWith(mockId, expect.any(Object));
    });

    it('should throw ValidationError for missing cancellation reason', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });

      await expect(intentService.cancelIntent(mockId)).rejects.toThrow();
    });

    it('should throw NotFoundError when intent does not exist', async () => {
      const mockId = 'non_existent_id';
      intentRepository.fetchIntentById.mockResolvedValue({ data: [], error: null });

      await expect(intentService.cancelIntent(mockId)).rejects.toThrow(
        `Intent with id ${mockId} not found`,
      );
    });

    it('should throw ValidationError when intent is not ready to be cancelled', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId, confirmed_at: new Date() };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });

      await expect(intentService.cancelIntent(mockId)).rejects.toThrow();
    });
  });

  describe('searchIntents', () => {
    it('should search intents successfully', async () => {
      const mockQuery = 'test';
      const mockIntents = [{ id: 'intent_1' }, { id: 'intent_2' }];
      intentRepository.searchIntents.mockResolvedValue({ data: mockIntents, error: null });

      const result = await intentService.searchIntents({ query: mockQuery });
      expect(result).toEqual(mockIntents);
      expect(intentRepository.searchIntents).toHaveBeenCalledWith(mockQuery);
    });

    it('should throw ValidationError for invalid query', async () => {
      const mockQuery = ''; // Empty string should be invalid
      await expect(intentService.searchIntents({ query: mockQuery })).rejects.toThrow();
    });

    it('should throw DatabaseError when repository fails', async () => {
      const mockQuery = 'test';
      intentRepository.searchIntents.mockResolvedValue({
        data: null,
        error: new Error('DB Error'),
      });

      await expect(intentService.searchIntents({ query: mockQuery })).rejects.toThrow(
        'Failed to search intents',
      );
    });
  });

  describe('deleteIntent', () => {
    it('should delete an intent successfully', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId, status: 'cancelled' };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });
      intentRepository.deleteIntent.mockResolvedValue({
        data: { id: mockId, deleted: true },
        error: null,
      });

      const result = await intentService.deleteIntent(mockId);
      expect(result).toEqual({ id: mockId, deleted: true });
      expect(intentRepository.deleteIntent).toHaveBeenCalledWith(mockId);
    });

    it('should throw NotFoundError when intent does not exist', async () => {
      const mockId = 'non_existent_id';
      intentRepository.fetchIntentById.mockResolvedValue({ data: [], error: null });

      await expect(intentService.deleteIntent(mockId)).rejects.toThrow(
        `Intent with id ${mockId} not found`,
      );
    });

    it('should throw ValidationError when intent is not ready to be deleted', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId, confirmed_at: new Date() };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });

      await expect(intentService.deleteIntent(mockId)).rejects.toThrow(
        'Intent is not ready to be deleted',
      );
    });

    it('should throw DatabaseError when repository fails', async () => {
      const mockId = 'intent_123';
      const mockIntent = { id: mockId };
      intentRepository.fetchIntentById.mockResolvedValue({ data: [mockIntent], error: null });
      intentRepository.deleteIntent.mockResolvedValue({ data: null, error: new Error('DB Error') });

      await expect(intentService.deleteIntent(mockId)).rejects.toThrow('Failed to delete intent');
    });
  });
});
