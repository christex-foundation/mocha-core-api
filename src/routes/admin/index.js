//@ts-check

import { Hono } from 'hono';
import * as apiKeysService from './api-keys.js';
import { adminAuth } from '../../middleware/admin-auth.js';

const app = new Hono();
app.use('/*', adminAuth);

app.post('/create', async (c) => {
  const body = await c.req.json();

  try {
    const data = await apiKeysService.createAPIKey(body);
    return c.json(data, 201);
  } catch (error) {
    console.error('Error creating API key:', error);
    return c.json({ error: error.message }, error.name === 'ValidationError' ? 400 : 500);
  }
});

app.post('/deactivate', async (c) => {
  const body = await c.req.json();

  try {
    await apiKeysService.deactivateAPIKey(body);
    return c.json({ message: 'API key deactivated successfully' }, 200);
  } catch (error) {
    console.error('Error deactivating API key:', error);
    return c.json({ error: error.message }, error.name === 'ValidationError' ? 400 : 500);
  }
});

app.post('/update-permissions', async (c) => {
  const body = await c.req.json();

  try {
    await apiKeysService.updateAPIKeyPermissions(body);
    return c.json({ message: 'Permissions updated successfully' }, 200);
  } catch (error) {
    console.error('Error updating API key permissions:', error);
    return c.json({ error: error.message }, error.name === 'ValidationError' ? 400 : 500);
  }
});

app.post('/update-rate-limit', async (c) => {
  const body = await c.req.json();

  try {
    await apiKeysService.updateAPIKeyRateLimit(body);
    return c.json({ message: 'Rate limit updated successfully' }, 200);
  } catch (error) {
    console.error('Error updating API key rate limit:', error);
    return c.json({ error: error.message }, error.name === 'ValidationError' ? 400 : 500);
  }
});

export default app;
