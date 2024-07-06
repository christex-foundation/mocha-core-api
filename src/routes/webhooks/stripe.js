//@ts-check

import { Hono } from 'hono';
import Stripe from 'stripe';
import { createStripeIntent } from '../intents/intents.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = new Hono();

app.post('/', async (c) => {
  const sig = c.req.header('stripe-signature');
  let event;

  try {
    const body = await c.req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object;

    try {
      const intentData = {
        object: 'cashout_intent',
        amount: checkoutSession.amount_total,
        amount_received: checkoutSession.amount_total,
        application: 'stripe',
        currency: checkoutSession.currency,
        payment_method: 'stripe',
        from_number: checkoutSession.customer_details?.phone,
        to_number: checkoutSession.custom_fields[0].text?.value,
        transaction_id: checkoutSession.id,
      };

      const intent = await createStripeIntent(intentData);
      console.log('Cashout intent created from Stripe payment:', intent.id);

      return c.json({ received: true });
    } catch (err) {
      console.error('Error processing Stripe webhook:', err);
      return c.json({ error: 'Error processing webhook' }, 500);
    }
  }

  return c.json({ received: true });
});

export default app;
