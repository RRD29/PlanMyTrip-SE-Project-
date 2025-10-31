import React, { useState, useEffect } from 'react'; // Added useEffect
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi'; // <-- NOW USED
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { StarIcon, MapPinIcon, CurrencyDollarIcon, CalendarIcon } from '../../assets/icons';
import ReviewList from '../../components/reviews/ReviewList';
import ReviewForm from '../../components/reviews/ReviewForm';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/axios'; // Import api for review submission

const GuideProfile = () => {
  const { guideId } = useParams(); // Get guide ID from URL
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // --- USE API TO FETCH GUIDE DATA ---
  const { data: guide, loading, error } = useApi(`/guides/${guideId}`); 
  
  // --- STATE FOR REVIEWS (Separate fetch) ---
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  // --- Fetch Reviews on Load ---
  useEffect(() => {
    if (!guideId) return; // Don't fetch if no ID
    
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        // We need a backend endpoint for this: /reviews/guide/:guideId
        const response = await api.get(`/reviews/guide/${guideId}`); 
        setReviews(response.data.data || []); 
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]); // Set to empty on error
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchReviews();
  }, [guideId]); // Refetch if guideId changes

  const handleBookNow = () => {
    // Navigate to trip planner, maybe pass guideId as state?
    navigate('/dashboard/trip-planner', { state: { preselectedGuideId: guideId } }); 
  };
  
  const handleReviewSubmit = async (rating, text) => {
    setSubmittingReview(true);
    try {
      // API endpoint to post a review
      const response = await api.post(`/reviews/guide/${guideId}`, { rating, text });
      // Add the new review to the top of the list
      setReviews([response.data.data, ...reviews]); 
    } catch (err) {
      alert('Failed to submit review. You may have already reviewed this guide.');
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // --- RENDER LOGIC ---

  if (loading) {
    return <PageLoader text="Loading guide profile..." />;
  }

  if (error || !guide) {
    return <p className="text-red-500 text-center p-8">Error: Could not load guide profile.</p>;
  }
  
  // Safely access profile data
  const profile = guide.guideProfile || {};
  const displayRating = profile.rating ? parseFloat(profile.rating).toFixed(1) : 0;
  const displayPrice = profile.pricePerDay || 'N/A';
  const displayLocation = profile.baseLocation || 'Location not set';
  const displayBio = profile.bio || 'No bio provided.';
  const joinedDate = guide.createdAt ? new Date(guide.createdAt).toLocaleDateString() : 'N/A';
  const displayLanguages = profile.languages ? profile.languages.join(', ') : 'Not specified';
  const displayExpertiseRegions = profile.expertiseRegions ? profile.expertiseRegions.join(', ') : 'Not specified';
  const displaySpecialties = profile.specialties ? profile.specialties.join(', ') : 'Not specified';
  const displayAvailability = profile.availabilitySchedule || 'Not specified';
  const displayYearsExperience = profile.yearsExperience || 'Not specified';


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
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover" // Added object-cover
              />
              <h1 className="text-3xl font-bold text-gray-900">{guide.fullName}</h1>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-gray-700">{displayRating}</span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>
              
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-center text-gray-700">
                  <MapPinIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                  <span>{displayLocation}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold">
                    {displayPrice === 'N/A' ? 'Price not set' : `$${displayPrice} / day`}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CalendarIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button size="lg" className="w-full" onClick={handleBookNow}>
                  Book This Guide
                </Button>
                {/* Add Chat functionality later */}
                {/* <Button variant="secondary" size="lg" className="w-full">
                  Chat with {guide.fullName.split(' ')[0]}
                </Button> */}
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
                {displayBio}
              </p>
            </div>

            {/* Professional Details Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Professional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Years of Experience</h3>
                  <p className="text-gray-700">{displayYearsExperience}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Languages</h3>
                  <p className="text-gray-700">{displayLanguages}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Expertise Regions</h3>
                  <p className="text-gray-700">{displayExpertiseRegions}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Specialties</h3>
                  <p className="text-gray-700">{displaySpecialties}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-900">Availability</h3>
                  <p className="text-gray-700">{displayAvailability}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <ReviewList reviews={reviews} loading={reviewsLoading} />
            </div>
            
            {/* Leave a Review Section */}
            {user && user.role === 'user' && ( // Only show review form if user is logged in AND is a 'user'
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