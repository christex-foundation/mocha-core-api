//@ts-check
import { Hono } from 'hono';
import { transfer } from '../intents/transfer.js';
import { apiKeyAuth } from '../../middleware/api-key-auth.js';
import { errorHandler } from '../../middleware/error-handler.js';

const app = new Hono();
app.use('/*', apiKeyAuth);
app.onError(errorHandler);

app.post('/', async (c) => {
  const body = await c.req.raw.json().catch(() => ({}));

  const data = await transfer(body);
  return c.json(data, 200);
});

export default app;
