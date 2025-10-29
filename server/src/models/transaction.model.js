import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // The user who paid
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: 'User', // The guide who will be paid
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'charge', // Money from user to admin (escrow)
        'payout', // Money from admin to guide
        'refund', // Money from admin back to user
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
    stripeId: {
      type: String, // The Stripe object ID (pi_, ch_, tr_, re_)
      required: true,
      index: true,
    },
    notes: {
      type: String, // e.g., "Admin manual dispute resolution"
    }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);