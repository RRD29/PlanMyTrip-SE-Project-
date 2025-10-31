import Stripe from 'stripe';
import config from './index.js';

if (!config.STRIPE_SECRET_KEY) {
  console.warn("Stripe secret key is not defined. Please set STRIPE_SECRET_KEY in your .env file. Using test key for development.");
  // Use a test key for development if not set
  config.STRIPE_SECRET_KEY = 'sk_test_...'; // Replace with actual test key if needed
}

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use the latest API version
});
