import { z } from 'zod';
import { parseNumber } from './parse-number.js';

export const createIntentSchema = z.object({
  from_number: z.string(),
  object: z.string(),
});

export const updateIntentSchema = z.object({
  from_number: z.string().optional(),
  to_number: z.string().optional(),
  amount: z
    .union([
      z.number().int({
        message: 'Amount should be an integer',
      }),
      z.string().transform((val, ctx) => {
        const parsed = parseNumber(val);
        if (parsed === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid number format',
          });
          return z.NEVER;
        }
        return parsed;
      }),
    ])
    .optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  cancellation_reason: z.string().optional(),
  payment_method: z.string().optional(),
  amount_received: z.number().optional(),
  transaction_id: z.string().optional(),
});

export const searchIntentSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
});

export const cancelIntentSchema = z.object({
  cancellation_reason: z.string().min(1, 'Cancellation reason cannot be empty'),
});

export const createStripeIntentSchema = z.object({
  object: z.literal('cashout_intent'),
  amount: z.number(),
  amount_received: z.number().optional(),
  application: z.literal('stripe'),
  currency: z.string(),
  payment_method: z.literal('stripe'),
  from_number: z.string(),
  to_number: z.string(),
  transaction_id: z.string(),
});
