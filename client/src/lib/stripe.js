import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe.js script with your publishable key
// This returns a promise that resolves with the Stripe object.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;

/*
// --- How you'll use this file later (e.g., in BookingPage.js) ---

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../lib/stripe'; // <-- Import the promise
import PaymentForm from './PaymentForm'; // A new component you'll create

const BookingPage = () => {
  // You would get the clientSecret from your BookingContext
  const clientSecret = 'pi_...'; 

  const options = {
    clientSecret,
    // You can customize the payment form appearance here
    appearance: { theme: 'stripe' }, 
  };

  return (
    <div>
      <h2>Confirm Your Booking</h2>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      )}
    </div>
  );
}
*/