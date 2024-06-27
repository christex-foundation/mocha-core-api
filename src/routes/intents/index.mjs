//@ts-check
import { Hono } from 'hono';
import {
  createIntent,
  updateIntent,
  fetchAllIntents,
  fetchAllUserIntents,
  fetchIntentById,
  confirmIntent,
  cancelIntent,
  searchIntents,
  deleteIntent,
} from './intents.mjs';
import { errorHandler } from '../../middleware/error-handler.mjs';

const app = new Hono();
app.onError(errorHandler);

//create intent
app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));

  const data = await createIntent(body);
  return c.json(data, 201);
});

//update intent
// should be app.put but limitation on twilio studio
app.post('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  const data = await updateIntent(id, body);
  return c.json(data, 200);
});

// Fetch all intents
app.get('/', async (c) => {
  const data = await fetchAllIntents();
  return c.json(data, 200);
});

// Fetch all user intents
app.get('/user/:from_number', async (c) => {
  const from_number = c.req.param('from_number');

  const data = await fetchAllUserIntents(from_number);
  return c.json(data, 200);
});

// Fetch intent by id
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  const data = await fetchIntentById(id);
  return c.json(data, 200);
});

//confirm intent
app.post('/:id/confirm', async (c) => {
  const id = c.req.param('id');

  const data = await confirmIntent(id);
  return c.json(data, 200);
});

// Cancel intent
app.post('/:id/cancel', async (c) => {
  const id = c.req.param('id');

  const data = await cancelIntent(id);
  return c.json(data, 200);
});

//search intent
app.post('/search', async (c) => {
  const body = await c.req.json().catch(() => ({}));

  const data = await searchIntents(body);
  return c.json(data, 200);
});

//delete intent
app.post('/:id/delete', async (c) => {
  const id = c.req.param('id');

  await deleteIntent(id);
  return c.json({ message: 'Intent deleted successfully' }, 200);
});

export default app;
