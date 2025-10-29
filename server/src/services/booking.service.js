import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOtp } from './otp.service.js';
import { createPaymentIntent, capturePayment } from './payment.service.js';

/**
 * Creates a new booking, generates OTPs, and creates a Stripe PaymentIntent.
 * @param {string} userId - The ID of the user making the booking.
 * @param {object} bookingData - { guideId, startDate, endDate, totalAmount, ... }
 * @returns {Promise<{booking: object, clientSecret: string}>}
 */
export const createBookingService = async (userId, bookingData) => {
  const { guideId, totalAmount } = bookingData;

  const user = await User.findById(userId);
  const guide = await User.findById(guideId);
  if (!guide || guide.role !== 'guide') {
    throw new ApiError(404, "Guide not found");
  }

  // TODO: Get/create Stripe Customer ID for the user
  // This is a complex but important step. For now, we'll skip it.
  const stripeCustomerId = "cus_MOCK_ID"; // user.stripeCustomerId;

  // 1. Create the booking document in our database first
  const booking = await Booking.create({
    user: userId,
    guide: guideId,
    totalAmount: totalAmount,
    tripDetails: bookingData.tripDetails,
    status: 'Pending Payment',
    otpUser: generateOtp(),
    otpGuide: generateOtp(),
    paymentIntentId: 'temp', // Temporary placeholder
  });

  // 2. Create the Stripe Payment Intent (which holds the money)
  try {
    const paymentIntent = await createPaymentIntent(
      totalAmount,
      stripeCustomerId,
      booking._id.toString()
    );

    // 3. Update our booking with the real PaymentIntent ID
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    return {
      booking,
      clientSecret: paymentIntent.client_secret, // Send this to the frontend
    };
  } catch (error) {
    // If Stripe fails, delete the booking we just created (rollback)
    await Booking.findByIdAndDelete(booking._id);
    throw error;
  }
};

/**
 * Verifies an OTP submitted by either a user or a guide.
 * If both parties have verified, it captures the payment.
 * @param {object} submitter - The user object (user or guide) submitting the OTP.
 * @param {string} bookingId - The ID of the booking to verify.
 * @param {string} otp - The 6-digit OTP being submitted.
 * @returns {Promise<object>} The updated booking object.
 */
export const verifyOtpService = async (submitter, bookingId, otp) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== 'Paid/Escrowed') {
    throw new ApiError(400, `Booking is not in a verifiable state (Status: ${booking.status})`);
  }

  // --- Logic for who is submitting what ---
  if (submitter.role === 'user' && booking.user.equals(submitter._id)) {
    // User is submitting the OTP they got from the Guide
    if (otp !== booking.otpGuide) {
      throw new ApiError(400, "Invalid OTP");
    }
    booking.otpVerifiedUser = true;
  } else if (submitter.role === 'guide' && booking.guide.equals(submitter._id)) {
    // Guide is submitting the OTP they got from the User
    if (otp !== booking.otpUser) {
      throw new ApiError(400, "Invalid OTP");
    }
    booking.otpVerifiedGuide = true;
  } else {
    throw new ApiError(403, "You are not authorized to verify this booking");
  }

  // --- Check if both parties have verified ---
  if (booking.otpVerifiedUser && booking.otpVerifiedGuide) {
    booking.status = 'OTP Verified';
    
    try {
      // Both confirmed! Capture the payment (release from escrow)
      await capturePayment(booking.paymentIntentId);
      booking.status = 'Completed';
      
      // Log the 'payout' transaction
      await Transaction.create({
        booking: booking._id,
        user: booking.user,
        guide: booking.guide,
        amount: booking.totalAmount, // This is a simplified amount
        type: 'payout',
        status: 'succeeded',
        stripeId: booking.paymentIntentId, // Associated with the original charge
      });
      
    } catch (paymentError) {
      console.error("Failed to capture payment after OTP verification:", paymentError);
      booking.status = 'Disputed'; // Set to disputed if capture fails
      // TODO: Alert admin
    }
  }

  await booking.save();
  return booking;
};