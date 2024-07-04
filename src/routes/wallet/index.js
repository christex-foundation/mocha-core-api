//@ts-check
import { Hono } from 'hono';
import { fetchWalletBalance } from './wallet.js';
import { apiKeyAuth } from '../../middleware/api-key-auth.js';
import { errorHandler } from '../../middleware/error-handler.js';

const app = new Hono();
app.use('/*', apiKeyAuth);
app.onError(errorHandler);

app.get('/:phone_number', async (c) => {
  const phoneNumber = c.req.param('phone_number');

  const balance = await fetchWalletBalance(phoneNumber);
  return c.json({ balance });
});

export default app;
