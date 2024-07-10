//@ts-check
import { z } from 'zod';
import { parseNumber } from './parse-number.js';

/**
 * Schema for creating a transfer
 */
export const createTransferSchema = z.object({
  from_number: z.union([z.string(), z.number()]),
  to_number: z.union([z.string(), z.number()]),
  amount: z.union([
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
  ]),
});
