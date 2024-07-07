//@ts-check

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fetchIntentByTransactionID } from '../intents/intents.js';

const app = new Hono();
app.use('/*', cors());

// Public route for fetching limited transaction information
app.get('/transaction/:transaction_id', async (c) => {
  const transaction_id = c.req.param('transaction_id');

  const data = await fetchIntentByTransactionID(transaction_id);
  return c.json(data, 200);
});

export default app;
