import React, { useState } from 'react';
import Button from '../common/Button';


const StarIconFilled = (props) => (
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

const StarIconOutline = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418c.47 0 .684.557.34.886l-4.4 3.66a.563.563 0 00-.18.518l1.68 5.33c.195.613-.53.996-1.064.66l-4.99-3.27a.563.563 0 00-.621 0l-4.99 3.27c-.534.336-1.259-.047-1.064-.66l1.68-5.33a.563.563 0 00-.18-.518l-4.4-3.66c-.344-.329-.13-.886.34-.886h5.418a.563.563 0 00.475-.31L11.48 3.5z"
    />
  </svg>
);



const ReviewForm = ({ onSubmit, submitting = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating.');
      return;
    }
    onSubmit(rating, text);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="mb-4">
        <h4 className="text-lg font-medium text-gray-800 mb-2">Your Rating:</h4>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const currentRating = hoverRating || rating;
            return (
              <label key={starValue} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={starValue}
                  onClick={() => setRating(starValue)}
                  className="sr-only" // Hide the actual radio button
                />
                <div
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-100 ease-in-out"
                >
                  {starValue <= currentRating ? (
                    <StarIconFilled className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-text"
          className="block text-lg font-medium text-gray-800 mb-2"
        >
          Your Review:
        </label>
        <textarea
          id="review-text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you like or dislike? (Optional)"
          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={submitting}
        ></textarea>
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;