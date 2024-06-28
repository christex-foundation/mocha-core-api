import { z } from 'zod';

export const createIntentSchema = z.object({
  from_number: z.string(),
  object: z.string(),
});

export const updateIntentSchema = z.object({
  from_number: z.string().optional(),
  to_number: z.string().optional(),
  amount: z
    .union([
      z.number(),
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

const parseNumber = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return null;

  // Remove commas and trim whitespace
  const cleaned = val.replace(/,/g, '').trim();

  // Parse the cleaned string
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
};
