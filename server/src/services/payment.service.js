import { stripe } from '../config/stripe.js';
import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';
import { Transaction } from '../models/transaction.model.js';
import { ApiError } from '../utils/ApiError.js';
import { sendBookingOtpEmail } from './email.service.js';


export const createPaymentIntent = async (amount, customerId, bookingId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: 'usd',
      customer: customerId,
      metadata: { bookingId },
      capture_method: 'manual', 
      description: `PlanMyTrip Booking ID: ${bookingId}`,
    });
    return paymentIntent;
  } catch (error) {
    throw new ApiError(500, `Stripe Error: ${error.message}`);
  }
};


export const capturePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    
    
    
    

    return paymentIntent;
  } catch (error) {
    throw new ApiError(500, `Stripe Capture Error: ${error.message}`);
  }
};


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

  
  if (booking.status === 'Pending Payment') {
    booking.status = 'Paid/Escrowed';
    await booking.save();

    
    await Transaction.create({
      booking: booking._id,
      user: booking.user,
      guide: booking.guide,
      amount: booking.totalAmount,
      type: 'charge',
      status: 'succeeded',
      stripeId: paymentIntent.id,
    });

    
    const user = await User.findById(booking.user);
    const guide = await User.findById(booking.guide);

    if (user && guide) {
      
      await sendBookingOtpEmail(booking, user, guide);
    }
  }
};