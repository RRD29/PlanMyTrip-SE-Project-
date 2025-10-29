import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { StarIcon, MapPinIcon, CurrencyDollarIcon, CalendarIcon } from '../../assets/icons';
import ReviewList from '../../components/reviews/ReviewList';
import ReviewForm from '../../components/reviews/ReviewForm';
import { useAuth } from '../../contexts/AuthContext';

// --- MOCK DATA (Remove when API is ready) ---
const MOCK_GUIDE = { 
  _id: 'g1', 
  fullName: 'Bob Johnson', 
  location: 'Paris, France', 
  rating: 4.9, 
  pricePerDay: 250, 
  bio: 'Parisian local, art history expert. I have been guiding for 10 years and specialize in the Louvre, Musée d\'Orsay, and the hidden streets of Montmartre. Let me show you the real Paris!', 
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80',
  joinedDate: '2023-01-15T10:00:00Z',
};
const MOCK_REVIEWS = [
  { _id: 'r1', user: { fullName: 'Alice Smith' }, rating: 5, text: 'Bob was amazing! So knowledgeable and friendly. Highly recommend!', createdAt: '2025-10-20T10:00:00Z' },
  { _id: 'r2', user: { fullName: 'Charlie Brown' }, rating: 4, text: 'Great tour of the Louvre. A bit fast-paced but we saw everything.', createdAt: '2025-10-18T14:15:00Z' },
];
// ---------------------------------------------

const GuideProfile = () => {
  const { guideId } = useParams(); // Get guide ID from URL
  const navigate = useNavigate();
  const { user } = useAuth(); // To check if user can leave a review

  // const { data: guide, loading, error } = useApi(`/guides/${guideId}`); // Real API for guide
  // const { data: reviews, loading: reviewsLoading, request: fetchReviews } = useApi(); // Real API for reviews
  
  const [guide, setGuide] = useState(MOCK_GUIDE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // You would fetch reviews for this guide on load
  // useEffect(() => {
  //   if(guideId) fetchReviews(`/reviews/guide/${guideId}`);
  // }, [guideId, fetchReviews]);

  const handleBookNow = () => {
    // This would navigate to the trip planner, pre-filled with this guide's info
    // Or directly to a booking page
    navigate('/dashboard/trip-planner'); 
  };
  
  const handleReviewSubmit = async (rating, text) => {
    setSubmittingReview(true);
    // try {
    //   const newReview = await api.post(`/reviews/guide/${guideId}`, { rating, text });
    //   setReviews([newReview.data.data, ...reviews]);
    // } catch (err) {
    //   alert('Failed to submit review.');
    // } finally {
    //   setSubmittingReview(false);
    // }
    
    // Mock submit
    setTimeout(() => {
      const newReview = { _id: `r${Math.random()}`, user: { fullName: user.fullName }, rating, text, createdAt: new Date().toISOString() };
      setReviews([newReview, ...reviews]);
      setSubmittingReview(false);
    }, 1000);
  };

  if (loading) {
    return <PageLoader text="Loading guide profile..." />;
  }

  if (error || !guide) {
    return <p className="text-red-500 text-center p-8">Error: Could not load guide profile.</p>;
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* --- Left Column: Profile Card --- */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
              <img 
                src={guide.avatar} 
                alt={guide.fullName}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500"
              />
              <h1 className="text-3xl font-bold text-gray-900">{guide.fullName}</h1>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-gray-700">{guide.rating}</span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>
              
              <div className="mt-6 space-y-2 text-left">
                <div className_="flex items-center text-gray-700">
                  <MapPinIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{guide.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-semibold">{guide.pricePerDay} / day</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <span>Joined {new Date(guide.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button size="lg" className="w-full" onClick={handleBookNow}>
                  Book This Guide
                </Button>
                <Button variant="secondary" size="lg" className="w-full">
                  Chat with {guide.fullName.split(' ')[0]}
                </Button>
              </div>
            </div>
          </aside>

          {/* --- Right Column: Bio & Reviews --- */}
          <main className="lg:col-span-2 space-y-8">
            {/* About Me Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                About Me
              </h2>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {guide.bio}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <ReviewList reviews={reviews} loading={reviewsLoading} />
            </div>
            
            {/* Leave a Review Section */}
            {user && ( // Only show review form if user is logged in
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Leave a Review for {guide.fullName.split(' ')[0]}
                </h2>
                <ReviewForm 
                  onSubmit={handleReviewSubmit}
                  submitting={submittingReview}
                />
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default GuideProfile;