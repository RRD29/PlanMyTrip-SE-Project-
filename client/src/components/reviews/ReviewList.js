import React from 'react';
import { SkeletonText } from '../common/Loaders';
import { UserIcon } from '../../assets/icons'; // Using your icon pack

// --- Star Icon (Filled) ---
const StarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.518.77 2.188l-4.254 3.917 1.17 5.259c.27 1.121-.977 2.016-1.928 1.418L12 18.273l-4.908 2.855c-.951.598-2.198-.297-1.928-1.418l1.17-5.259-4.254-3.917c-.866-.67-.394-2.095.77-2.188l5.404-.433L10.788 3.21z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Static Star Rating Display ---
const StaticRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={index}
            className={`w-5 h-5 ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};

// --- Single Review Item ---
const ReviewItem = ({ review }) => {
  // Format the date (e.g., "October 27, 2025")
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="py-6 border-b border-gray-200">
      <div className="flex items-center mb-3">
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-gray-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold text-gray-900">
            {review.user.fullName}
          </p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>

      <div className="mb-3">
        <StaticRating rating={review.rating} />
      </div>

      {review.text && (
        <p className="text-base text-gray-700 leading-relaxed">
          {review.text}
        </p>
      )}
    </article>
  );
};

// --- List Skeleton Loader ---
const ReviewListSkeleton = () => (
  <div className="space-y-6">
    {[1, 2].map((n) => (
      <div key={n} className="py-6 border-b border-gray-200">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="ml-3 w-1/2">
            <SkeletonText className="h-5 mb-2" />
            <SkeletonText className="h-3 w-1/3" />
          </div>
        </div>
        <SkeletonText className="h-4 w-1/4 mb-3" />
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-3/4 mt-2" />
      </div>
    ))}
  </div>
);

/**
 * Displays a list of reviews.
 * @param {object} props
 * @param {Array<object>} props.reviews - The array of review objects
 * @param {boolean} [props.loading=false] - Show loading skeleton
 */
const ReviewList = ({ reviews = [], loading = false }) => {
  if (loading) {
    return <ReviewListSkeleton />;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-medium text-gray-700">No Reviews Yet</h4>
        <p className="text-gray-500 mt-1">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        What people are saying
      </h3>
      <div className="divide-y divide-gray-200 -my-6">
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;