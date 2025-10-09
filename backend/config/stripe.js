// config/stripe.js
const Stripe = require('stripe');

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-06-20',
  });
}

module.exports = { getStripeClient };


