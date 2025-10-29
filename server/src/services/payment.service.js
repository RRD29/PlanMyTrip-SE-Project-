import { stripe } from '../config/stripe.js';
import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';
import { Transaction } from '../models/transaction.model.js';
import { ApiError } from '../utils/ApiError.js';
import { sendBookingOtpEmail } from './email.service.js';

/**
 * Creates a Stripe Payment Intent.
 * This function *authorizes* the payment but doesn't capture it yet (escrow).
 * @param {number} amount - The amount in USD.
 * @param {string} customerId - The Stripe customer ID.
 * @param {string} bookingId - The booking ID for metadata.
 * @returns {Promise<object>} The Stripe PaymentIntent object.
 */
export const createPaymentIntent = async (amount, customerId, bookingId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires cents
      currency: 'usd',
      customer: customerId,
      metadata: { bookingId },
      capture_method: 'manual', // <-- THIS IS THE KEY TO ESCROW
      description: `PlanMyTrip Booking ID: ${bookingId}`,
    });
    return paymentIntent;
  } catch (error) {
    throw new ApiError(500, `Stripe Error: ${error.message}`);
  }
};

/**
 * Captures the funds held in escrow for a given PaymentIntent.
 * This is called *after* OTPs are verified.
 * @param {string} paymentIntentId - The ID of the Stripe PaymentIntent.
 * @returns {Promise<object>} The captured PaymentIntent object.
 */
export const capturePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    
    // TODO: In a real app, you would create a Payout to the guide
    // This requires Stripe Connect (Express accounts) for the guides.
    // e.g., await createPayout(guideStripeAccountId, amount);

    return paymentIntent;
  } catch (error) {
    throw new ApiError(500, `Stripe Capture Error: ${error.message}`);
  }
};

/**
 * Handles the 'payment_intent.succeeded' webhook from Stripe.
 * This is called *after* the user pays, but *before* the trip.
 * It updates the booking status to 'Paid/Escrowed' and sends the OTPs.
 * @param {object} paymentIntent - The PaymentIntent object from the Stripe event.
 */
export const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;
  if (!bookingId) {
    console.error("Webhook Error: No bookingId in PaymentIntent metadata.");
    return;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.error(`Webhook Error: Booking not found for ID: ${bookingId}`);
    return;
  }

  // Idempotency check: Only update if it's still 'Pending Payment'
  if (booking.status === 'Pending Payment') {
    booking.status = 'Paid/Escrowed';
    await booking.save();

    // Create a 'charge' transaction for the admin log
    await Transaction.create({
      booking: booking._id,
      user: booking.user,
      guide: booking.guide,
      amount: booking.totalAmount,
      type: 'charge',
      status: 'succeeded',
      stripeId: paymentIntent.id,
    });

    // Fetch user and guide for emails
    const user = await User.findById(booking.user);
    const guide = await User.findById(booking.guide);

    if (user && guide) {
      // Send OTP emails to both parties
      await sendBookingOtpEmail(booking, user, guide);
    }
  }
};