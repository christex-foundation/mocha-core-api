//@ts-check
import { Hono } from 'hono';
import { apiKeyAuth } from '../../middleware/api-key-auth.js';
import { errorHandler } from '../../middleware/error-handler.js';
import { fetchSavings, makeSavingsDeposit } from './savings.js';

const app = new Hono();
app.use('/*', apiKeyAuth);
app.onError(errorHandler);

app.get('/:uid', async (c) => {
  const uid = c.req.param('uid');
  const savings = await fetchSavings(uid);

  return c.json({ savings });
});

app.post('/:uid/deposit', async (c) => {
  const uid = c.req.param('uid');
  const { depositAmount } = await c.req.json();

  if (!depositAmount) {
    return c.json({ error: 'Missing required parameters' }, 400);
  }

  const deposit = await makeSavingsDeposit(uid, depositAmount);

  return c.json(deposit);
});

export default app;
