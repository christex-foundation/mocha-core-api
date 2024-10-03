import { jest } from '@jest/globals';

// Mock the Twilio client
jest.unstable_mockModule('../../src/utils/twilio.js', () => ({
  createTwilioClient: jest.fn(),
}));

// Mock the errors module
jest.unstable_mockModule('../../src/utils/errors.js', () => ({
  createPhoneValidationError: jest.fn(),
}));

describe('Phone Validation Utility', () => {
  let phoneValidation;
  let twilioUtils;
  let errorsUtils;

  beforeAll(async () => {
    phoneValidation = await import('../../src/utils/phoneValidation.js');
    twilioUtils = await import('../../src/utils/twilio.js');
    errorsUtils = await import('../../src/utils/errors.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validatePhoneNumber', () => {
    it('should validate a phone number successfully', async () => {
      const mockPhoneNumber = '+1234567890';
      const mockTwilioResponse = {
        valid: true,
        phoneNumber: '+1234567890',
        countryCode: 'US',
        nationalFormat: '(234) 567-890',
      };

      const mockTwilioClient = {
        lookups: {
          v2: {
            phoneNumbers: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(mockTwilioResponse),
            }),
          },
        },
      };

      twilioUtils.createTwilioClient.mockReturnValue(mockTwilioClient);

      const result = await phoneValidation.validatePhoneNumber(mockPhoneNumber);
      expect(result).toEqual({
        phoneNumber: '+1234567890',
        countryCode: 'US',
        nationalFormat: '(234) 567-890',
      });
      expect(twilioUtils.createTwilioClient).toHaveBeenCalled();
      expect(mockTwilioClient.lookups.v2.phoneNumbers).toHaveBeenCalledWith(mockPhoneNumber);
    });

    it('should throw an error for an invalid phone number', async () => {
      const mockPhoneNumber = '+1234567890';
      const mockTwilioResponse = {
        valid: false,
      };

      const mockTwilioClient = {
        lookups: {
          v2: {
            phoneNumbers: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(mockTwilioResponse),
            }),
          },
        },
      };

      twilioUtils.createTwilioClient.mockReturnValue(mockTwilioClient);
      errorsUtils.createPhoneValidationError.mockReturnValue(new Error('Invalid phone number'));

      await expect(phoneValidation.validatePhoneNumber(mockPhoneNumber)).rejects.toThrow(
        'Invalid phone number',
      );
      expect(errorsUtils.createPhoneValidationError).toHaveBeenCalledWith(mockPhoneNumber);
    });

    it('should handle Twilio API errors', async () => {
      const mockPhoneNumber = '+1234567890';
      const mockError = new Error('Twilio API error');

      const mockTwilioClient = {
        lookups: {
          v2: {
            phoneNumbers: jest.fn().mockReturnValue({
              fetch: jest.fn().mockRejectedValue(mockError),
            }),
          },
        },
      };

      twilioUtils.createTwilioClient.mockReturnValue(mockTwilioClient);

      await expect(phoneValidation.validatePhoneNumber(mockPhoneNumber)).rejects.toThrow(
        'Twilio API error',
      );
    });
  });
});
