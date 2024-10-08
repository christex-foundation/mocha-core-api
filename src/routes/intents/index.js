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
  fetchIntentByTransactionID,
} from './intents.js';
import { errorHandler } from '../../middleware/error-handler.js';
import { apiKeyAuth } from '../../middleware/api-key-auth.js';

const app = new Hono();
app.use('/*', apiKeyAuth);
app.onError(errorHandler);

//create intent
app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const application = c.get('application');

  const data = await createIntent(body, application);
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
  const application = c.get('application');

  const data = await fetchAllIntents(application);
  return c.json(data, 200);
});

// Fetch all user intents
app.get('/user/:from_number', async (c) => {
  const from_number = c.req.param('from_number');
  const application = c.get('application');

  const data = await fetchAllUserIntents(from_number, application);
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
  const body = await c.req.json().catch(() => ({}));

  const data = await cancelIntent(id, body);
  return c.json(data, 200);
});

//search intent
app.post('/search', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const application = c.get('application');

  const data = await searchIntents(body, application);
  return c.json(data, 200);
});

//delete intent
app.post('/:id/delete', async (c) => {
  const id = c.req.param('id');

  await deleteIntent(id);
  return c.json({ message: 'Intent deleted successfully' }, 200);
});

export default app;
