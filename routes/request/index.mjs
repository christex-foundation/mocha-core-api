//@ts-check
import { Hono } from 'hono';
import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();

const app = new Hono();

app.get('/', (c) => c.json('Hello Request!'));
app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));

  return c.json('Created request!', 201);
});

export default app;
