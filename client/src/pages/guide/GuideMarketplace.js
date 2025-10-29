import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { StarIcon, MapPinIcon, CurrencyDollarIcon } from '../../assets/icons'; // From your icon pack

// --- MOCK DATA (Remove when API is ready) ---
const MOCK_GUIDES = [
  { _id: 'g1', fullName: 'Bob Johnson', location: 'Paris, France', rating: 4.9, pricePerDay: 250, bio: 'Parisian local, art history expert.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80' },
  { _id: 'g2', fullName: 'David Lee', location: 'Tokyo, Japan', rating: 4.8, pricePerDay: 300, bio: 'Food and culture enthusiast in Tokyo.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80' },
  { _id: 'g3', fullName: 'Maria Garcia', location: 'Rome, Italy', rating: 5.0, pricePerDay: 280, bio: 'Explore ancient Rome with a passionate historian.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80' },
  { _id: 'g4', fullName: 'Ken Tanaka', location: 'Kyoto, Japan', rating: 4.7, pricePerDay: 260, bio: 'Temple tours and hidden gems.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80' },
];
// ---------------------------------------------

// --- Single Guide Card Component ---
const GuideCard = ({ guide }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex-shrink-0">
        <img className="h-48 w-full object-cover" src={guide.avatar} alt={guide.fullName} />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">{guide.fullName}</h3>
            <div className="flex items-center space-x-1">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-gray-700">{guide.rating}</span>
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            <span>{guide.location}</span>
          </div>
          <p className="mt-3 text-base text-gray-600 line-clamp-2">{guide.bio}</p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="ml-1.5 text-xl font-bold text-gray-900">{guide.pricePerDay}</span>
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
  // const { data: guides, loading, error } = useApi('/guides'); // Real API
  const [guides, setGuides] = useState(MOCK_GUIDES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  // Filter guides based on search and location
  const filteredGuides = useMemo(() => {
    return (guides || []).filter(guide => {
      const matchesSearch = guide.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            guide.bio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = guide.location.toLowerCase().includes(location.toLowerCase());
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

        {/* --- Filter Bar --- */}
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
              <p className="text-gray-600 md:col-span-3 text-center">No guides found matching your criteria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideMarketplace;