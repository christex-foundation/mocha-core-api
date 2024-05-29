//@ts-check
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.json('Hello Intents!'));

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));

  return c.json('Created Intent!', 201);
});

export default app;
