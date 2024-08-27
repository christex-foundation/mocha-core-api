//@ts-check
import { Hono } from 'hono';
import { apiKeyAuth } from '../../middleware/api-key-auth.js';
import { errorHandler } from '../../middleware/error-handler.js';
import { fetchSavings } from './savings.js';

const app = new Hono();
app.use('/*', apiKeyAuth);
app.onError(errorHandler);

app.get('/:uid', async (c) => {
  const uid = c.req.param('uid');
  const savings = await fetchSavings(uid);

  return c.json({ savings });
});

export default app;
