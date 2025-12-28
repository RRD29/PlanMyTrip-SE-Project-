import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useApi from '../../hooks/useApi'; 
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { StarIcon, MapPinIcon, CurrencyDollarIcon } from '../../assets/icons'; 


const GuideCard = ({ guide }) => {
  const navigate = useNavigate();
  
  
  const displayRating = guide.guideProfile?.rating ? parseFloat(guide.guideProfile.rating).toFixed(1) : 0;
  const displayPrice = guide.guideProfile?.pricePerDay || 'N/A';
  const displayLocation = guide.guideProfile?.baseLocation || 'Unspecified Location';
  const displayBio = guide.guideProfile?.bio || 'This guide is still setting up their profile.';
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex-shrink-0">
        {}
        <img className="h-48 w-full object-cover" src={guide.avatar} alt={guide.fullName} />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">{guide.fullName}</h3>
            <div className="flex items-center space-x-1">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-gray-700">{displayRating}</span>
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            <span>{displayLocation}</span>
          </div>
          <p className="mt-3 text-base text-gray-600 line-clamp-2">{displayBio}</p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="ml-1.5 text-xl font-bold text-gray-900">
              {displayPrice === 'N/A' ? 'N/A' : `$${displayPrice}`}
            </span>
            <span className="ml-1 text-sm text-gray-500">/ day</span>
          </div>
          <Button size="md" onClick={() => navigate(`/guide/${guide._id}`)}>
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
};


const GuideMarketplace = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState(searchParams.get('destination') || ''); // Pre-fill location from URL
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // This state holds the filters that are *actually* being sent to the API
  const [appliedFilters, setAppliedFilters] = useState({
    destination: searchParams.get('destination') || '',
    location: '',
    search: '',
  });

  // Build query parameters for API call
  const queryParams = useMemo(() => {
    const params = {};
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.location) params.location = appliedFilters.location;
    if (appliedFilters.minPrice) params.minPrice = appliedFilters.minPrice;
    if (appliedFilters.maxPrice) params.maxPrice = appliedFilters.maxPrice;
    if (appliedFilters.minRating) params.minRating = appliedFilters.minRating;
    if (appliedFilters.minExperience) params.minExperience = appliedFilters.minExperience;
    if (appliedFilters.destination) params.destination = appliedFilters.destination;
    return params;
  }, [appliedFilters]);

  // --- USING REAL API HERE ---
  // The hook automatically runs on mount with the initial queryParams
  const { data: guides, loading, error, request } = useApi('/guides', { params: queryParams, method: 'GET' });

  
  useEffect(() => {
    const destination = searchParams.get('destination');
    if (destination) {
      setLocation(destination); 
      const newFilters = { ...appliedFilters, destination: destination, location: '' };
      setAppliedFilters(newFilters);
      request('/guides', { params: newFilters, method: 'GET' });
    }
    
    
  }, [searchParams]);

  
  const applyAllFilters = () => {
    const destination = searchParams.get('destination');
    const newFilters = {
      search: searchTerm,
      location: location,
      minPrice: minPrice,
      maxPrice: maxPrice,
      minRating: minRating,
      minExperience: minExperience,
      
      destination: destination || location, 
    };
    
    if (destination) {
        newFilters.location = ''; // Use destination for expertise search
    }

    setAppliedFilters(newFilters);
    // Manually trigger API call with new params
    request('/guides', { params: newFilters, method: 'GET' });
  };

  if (error) {
    return <p className="text-red-500 text-center p-8">Error: {error}</p>;
  }

  const destinationFromUrl = searchParams.get('destination');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {destinationFromUrl 
            ? `Guides for your trip to ${destinationFromUrl}` 
            : "Find Your Perfect Guide"}
        </h1>

        {}
        <div className="mb-8 p-6 bg-white rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Name or Keyword</label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., 'art', 'food', 'Bob'"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex items-end justify-center">
              <span className="text-sm text-gray-600">Search by name or location</span>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Destination</label>
              <input
                type="text"
                id="location"
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., 'Paris', 'Tokyo'"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="self-end">
              <Button onClick={applyAllFilters} className="w-full md:w-auto" size="lg">Search</Button>
            </div>
          </div>

          {}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center"
            >
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
              <svg className={`ml-1 w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilters && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price ($)</label>
                    <input
                      type="number"
                      id="minPrice"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Max Price ($)</label>
                    <input
                      type="number"
                      id="maxPrice"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="1000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="minRating" className="block text-sm font-medium text-gray-700">Min Rating</label>
                    <select
                      id="minRating"
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="">Any</option>
                      <option value="1">1+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="minExperience" className="block text-sm font-medium text-gray-700">Min Experience (Years)</label>
                    <input
                      type="number"
                      id="minExperience"
                      value={minExperience}
                      onChange={(e) => setMinExperience(e.target.value)}
                      placeholder="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={applyAllFilters} size="md" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        {loading ? (
          <PageLoader text="Finding guides..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(guides || []).length > 0 ? (
              (guides || []).map(guide => (
                <GuideCard key={guide._id} guide={guide} />
              ))
            ) : (
              <p className="text-gray-600 md:col-span-3 text-center">
                {searchTerm || location || minPrice || maxPrice || minRating || minExperience ? "No guides found matching your filters." : "No guides have registered yet."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideMarketplace;