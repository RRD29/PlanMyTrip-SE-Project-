import Stripe from 'stripe';
import config from './index.js';

if (!config.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is not defined. Please set STRIPE_SECRET_KEY in your .env file.");
}

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use the latest API version
});