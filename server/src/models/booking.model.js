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
      itinerary: [String], 
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Pending Payment', 
        'Paid/Escrowed', 
        'In Progress', 
        'OTP Verified', 
        'Completed', 
        'Cancelled', 
        'Disputed', 
      ],
      default: 'Pending Payment',
    },
    
    
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    
    otpUser: {
      
      type: String,
      required: true,
    },
    otpGuide: {
      
      type: String,
      required: true,
    },
    otpVerifiedUser: {
      
      type: Boolean,
      default: false,
    },
    otpVerifiedGuide: {
      
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);