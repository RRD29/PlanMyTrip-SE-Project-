import Stripe from 'stripe';
import config from './index.js';

if (!config.STRIPE_SECRET_KEY) {
  console.warn("Stripe secret key is not defined. Please set STRIPE_SECRET_KEY in your .env file. Using test key for development.");
  
  config.STRIPE_SECRET_KEY = 'sk_test_...'; 
}

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', 
});
