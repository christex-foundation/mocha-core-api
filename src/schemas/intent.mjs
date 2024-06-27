import { z } from 'zod';

export const createIntentSchema = z.object({
  from_number: z.string(),
  object: z.string(),
});

export const updateIntentSchema = z.object({
  from_number: z.string().optional(),
  to_number: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  cancelation_reason: z.string().optional(),
  payment_method: z.string().optional(),
  amount_received: z.number().optional(),
  transaction_id: z.string().optional(),
});

export const searchIntentSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
});
