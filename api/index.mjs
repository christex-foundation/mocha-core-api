//@ts-check
import { Hono } from 'hono';
import wallet from '../src/routes/wallet/index.mjs';
import transfer from '../src/routes/transfer/index.mjs';
import convert from '../src/routes/convert/index.mjs';
import request from '../src/routes/request/index.mjs';
import intents from '../src/routes/intents/index.mjs';
import { handle } from '@hono/node-server/vercel';

const app = new Hono().basePath('/api');

app.route('/v1/wallet', wallet);
app.route('/v1/transfer', transfer);
app.route('/v1/convert', convert);
app.route('/v1/request', request);
app.route('/v1/intents', intents);

app.notFound((c) => {
  return c.text('Custom 404 Message', 404);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ success: false, message: err.message }, 500);
});

export default handle(app);
