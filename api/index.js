//@ts-check
import { Hono } from 'hono';
import wallet from '../src/routes/wallet/index.js';
import intents from '../src/routes/intents/index.js';
import apiKeys from '../src/routes/admin/index.js';
import stripe from '../src/routes/webhooks/stripe.js';
import publicEndpoints from '../src/routes/public/index.js';
import { handle } from '@hono/node-server/vercel';

export const config = {
  api: {
    bodyParser: false,
  },
};

const app = new Hono().basePath('/api');

// Public routes
app.route('/webhooks/stripe', stripe);
app.route('/v1/public', publicEndpoints);

// Protected routes
app.route('/v1/wallet', wallet);
app.route('/v1/intents', intents);

// Admin routes
app.route('/v1/admin/api-keys', apiKeys);

app.notFound((c) => {
  return c.text('Custom 404 Message', 404);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ success: false, message: err.message }, 500);
});

export default handle(app);
