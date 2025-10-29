import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema(
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
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // A user can only leave one review per booking
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      maxLength: 2000,
      trim: true,
    },
  },
  { timestamps: true }
);

// --- Add a hook to recalculate a guide's average rating after a review is saved ---
// This is advanced, but very important for a good system
reviewSchema.statics.calculateAverageRating = async function(guideId) {
  const stats = await this.aggregate([
    {
      $match: { guide: guideId }
    },
    {
      $group: {
        _id: '$guide',
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('User').findByIdAndUpdate(guideId, {
        'guideProfile.rating': stats[0].avgRating.toFixed(2)
      });
    } else {
      await mongoose.model('User').findByIdAndUpdate(guideId, {
        'guideProfile.rating': 0
      });
    }
  } catch (err) {
    console.error("Failed to update guide rating:", err);
  }
};

// Call the calculator after a review is saved or removed
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.guide);
});

reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.guide);
});


export const Review = mongoose.model('Review', reviewSchema);