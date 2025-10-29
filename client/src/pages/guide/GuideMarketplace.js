import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi'; // <-- NOW USED
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { StarIcon, MapPinIcon, CurrencyDollarIcon } from '../../assets/icons'; 

// --- Single Guide Card Component (Keep the same) ---
const GuideCard = ({ guide }) => {
  const navigate = useNavigate();
  
  // Provide defaults for potentially missing fields
  const displayRating = guide.guideProfile?.rating ? parseFloat(guide.guideProfile.rating).toFixed(1) : 0;
  const displayPrice = guide.guideProfile?.pricePerDay || 'N/A';
  const displayLocation = guide.guideProfile?.location || 'Unspecified Location';
  const displayBio = guide.guideProfile?.bio || 'This guide is still setting up their profile.';
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex-shrink-0">
        {/* Placeholder avatar */}
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

// --- Main Marketplace Page ---
const GuideMarketplace = () => {
  // --- USING REAL API HERE ---
  const { data: guides, loading, error } = useApi('/guides'); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  // Filter guides based on search and location
  const filteredGuides = useMemo(() => {
    // Ensure guides is an array before filtering
    return (guides || [])
      // Filter out guides who haven't set a profile (optional, but good for quality)
      // .filter(guide => guide.guideProfile?.location) 
      .filter(guide => {
        const profile = guide.guideProfile || {};
        const matchesSearch = guide.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              profile.bio?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = profile.location?.toLowerCase().includes(location.toLowerCase());
        return matchesSearch && matchesLocation;
      });
  }, [guides, searchTerm, location]);

  if (error) {
    return <p className="text-red-500 text-center p-8">Error: {error}</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Find Your Perfect Guide</h1>

        {/* --- Filter Bar --- (Keep as is) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-white rounded-lg shadow border">
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
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
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
            <Button className="w-full md:w-auto" size="lg">Search</Button>
          </div>
        </div>

        {/* --- Guides Grid --- */}
        {loading ? (
          <PageLoader text="Finding guides..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.length > 0 ? (
              filteredGuides.map(guide => (
                <GuideCard key={guide._id} guide={guide} />
              ))
            ) : (
              <p className="text-gray-600 md:col-span-3 text-center">
                {searchTerm || location ? "No guides found matching your filters." : "No guides have registered yet."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideMarketplace;