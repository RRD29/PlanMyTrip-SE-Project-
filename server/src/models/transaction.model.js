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
      ref: 'User', 
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'charge', 
        'payout', 
        'refund', 
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
    stripeId: {
      type: String, 
      required: true,
      index: true,
    },
    notes: {
      type: String, 
    }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);