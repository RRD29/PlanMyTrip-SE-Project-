import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripDetails: {
      destination: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      numberOfTravelers: { type: Number, default: 1 },
      itinerary: [String], // Array of places or notes
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Pending Payment', // Booking created, awaiting payment
        'Paid/Escrowed', // User has paid, money held by admin
        'In Progress', // Trip has started (based on date)
        'OTP Verified', // Meetup confirmed by both parties
        'Completed', // Payment released to guide
        'Cancelled', // Booking cancelled
        'Disputed', // User or guide raised an issue
      ],
      default: 'Pending Payment',
    },
    
    // --- Stripe & Escrow ---
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // --- OTP Verification System ---
    otpUser: {
      // The code the *user* must give to the *guide*
      type: String,
      required: true,
    },
    otpGuide: {
      // The code the *guide* must give to the *user*
      type: String,
      required: true,
    },
    otpVerifiedUser: {
      // True when user enters the guide's OTP
      type: Boolean,
      default: false,
    },
    otpVerifiedGuide: {
      // True when guide enters the user's OTP
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);