import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOtp } from './otp.service.js';
import { createPaymentIntent, capturePayment } from './payment.service.js';


export const createBookingService = async (userId, bookingData) => {
  const { guideId, totalAmount } = bookingData;

  const user = await User.findById(userId);
  const guide = await User.findById(guideId);
  if (!guide || guide.role !== 'guide') {
    throw new ApiError(404, "Guide not found");
  }

  
  
  const stripeCustomerId = "cus_MOCK_ID"; 

  
  const booking = await Booking.create({
    user: userId,
    guide: guideId,
    totalAmount: totalAmount,
    tripDetails: bookingData.tripDetails,
    status: 'Pending Payment',
    otpUser: generateOtp(),
    otpGuide: generateOtp(),
    paymentIntentId: 'temp', 
  });

  
  try {
    const paymentIntent = await createPaymentIntent(
      totalAmount,
      stripeCustomerId,
      booking._id.toString()
    );

    
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    return {
      booking,
      clientSecret: paymentIntent.client_secret, 
    };
  } catch (error) {
    
    await Booking.findByIdAndDelete(booking._id);
    throw error;
  }
};


export const verifyOtpService = async (submitter, bookingId, otp) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== 'Paid/Escrowed') {
    throw new ApiError(400, `Booking is not in a verifiable state (Status: ${booking.status})`);
  }

  
  if (submitter.role === 'user' && booking.user.equals(submitter._id)) {
    
    if (otp !== booking.otpGuide) {
      throw new ApiError(400, "Invalid OTP");
    }
    booking.otpVerifiedUser = true;
  } else if (submitter.role === 'guide' && booking.guide.equals(submitter._id)) {
    
    if (otp !== booking.otpUser) {
      throw new ApiError(400, "Invalid OTP");
    }
    booking.otpVerifiedGuide = true;
  } else {
    throw new ApiError(403, "You are not authorized to verify this booking");
  }

  
  if (booking.otpVerifiedUser && booking.otpVerifiedGuide) {
    booking.status = 'OTP Verified';
    
    try {
      
      await capturePayment(booking.paymentIntentId);
      booking.status = 'Completed';
      
      
      await Transaction.create({
        booking: booking._id,
        user: booking.user,
        guide: booking.guide,
        amount: booking.totalAmount, 
        type: 'payout',
        status: 'succeeded',
        stripeId: booking.paymentIntentId, 
      });
      
    } catch (paymentError) {
      console.error("Failed to capture payment after OTP verification:", paymentError);
      booking.status = 'Disputed'; 
      
    }
  }

  await booking.save();
  return booking;
};