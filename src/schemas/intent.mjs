import { z } from 'zod';

export const createIntentSchema = z.object({
  from_number: z.string(),
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
});
