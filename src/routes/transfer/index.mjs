//@ts-check
import { Hono } from 'hono';
import { transfer } from './transfer.mjs';
import { apiKeyAuth } from '../../middleware/api-key-auth.mjs';

const app = new Hono();
app.use('/*', apiKeyAuth);

app.get('/', (c) => c.json('Hello Transfer!'));
app.post('/', async (c) => {
  const { fromNumber, toNumber, amount } = await c.req.raw.json().catch(() => ({}));
  if (!fromNumber || !toNumber || !amount) {
    return c.json(
      {
        message: 'Invalid request; missing `fromNumber`, `toNumber`, or `amount`',
      },
      400,
    );
  }

  const transactionId = await transfer(fromNumber, toNumber, Number(amount));
  return c.json(
    {
      message: 'Transfer successful',
      fromNumber,
      toNumber,
      amount,
      transactionId,
    },
    200,
  );
});

export default app;
