import React, { useState, useCallback, useEffect } from 'react';
import { geocodeAddress, fetchNearbyPlaces, fetchPlaceDetails, calculateDistance, fetchAutocompleteSuggestions } from '../../utils/geoapify-utils';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const ExplorePlaces = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchLocation, setSearchLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Categories for nearby places: Hotels, Restaurants, Cafes, Shopping, Parks
  const categories = [
    'accommodation.hotel',
    'catering.restaurant',
    'catering.cafe',
    'commercial.shopping_mall',
    'commercial.supermarket',
    'leisure.park'
  ];

  
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const suggs = await fetchAutocompleteSuggestions(query);
      setSuggestions(suggs);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setPlaces({});
    setShowSuggestions(false); // Hide suggestions on search

    try {
      // Geocode the search query to get lat/lng
      const location = await geocodeAddress(searchQuery.trim());
      setSearchLocation(location);

      // Fetch nearby places
      const nearbyPlaces = await fetchNearbyPlaces(location.lat, location.lng, categories, 5000, 20);

      // Group places by category and calculate distance if not provided
      const groupedPlaces = {};
      nearbyPlaces.forEach(place => {
        const category = getCategoryName(place.categories);
        if (!groupedPlaces[category]) {
          groupedPlaces[category] = [];
        }
        // Calculate distance if not provided by API
        if (place.distance === null || place.distance === undefined) {
          place.distance = calculateDistance(location.lat, location.lng, place.lat, place.lng) * 1000; // Convert to meters
        }
        groupedPlaces[category].push(place);
      });

      // Sort places within each category by distance
      Object.keys(groupedPlaces).forEach(category => {
        groupedPlaces[category].sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      });

      setPlaces(groupedPlaces);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search for places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    // Optionally trigger search immediately
    // handleSearch();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputBlur = () => {
    
    setTimeout(() => setShowSuggestions(false), 150);
  };

  
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handlePlaceClick = async (place) => {
    setSelectedPlace(place);
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);

    try {
      const details = await fetchPlaceDetails(place.place_id);
      setPlaceDetails(details);
    } catch (err) {
      console.error('Details fetch error:', err);
      setPlaceDetails({ name: place.name, address: place.address, error: 'Failed to load details.' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const getCategoryIcon = (categories) => {
    if (categories.includes('accommodation.hotel')) return '🏨';
    if (categories.includes('catering.restaurant')) return '🍽️';
    if (categories.includes('catering.cafe')) return '☕';
    if (categories.includes('commercial.shopping_mall') || categories.includes('commercial.supermarket')) return '🛍️';
    if (categories.includes('leisure.park')) return '🌳';
    return '📍';
  };

  const getCategoryName = (categories) => {
    if (categories.includes('accommodation.hotel')) return 'Hotels';
    if (categories.includes('catering.restaurant')) return 'Restaurants';
    if (categories.includes('catering.cafe')) return 'Cafes';
    if (categories.includes('commercial.shopping_mall')) return 'Shopping';
    if (categories.includes('commercial.supermarket')) return 'Shopping';
    if (categories.includes('leisure.park')) return 'Parks';
    return 'Places';
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Places</h1>

      {}
      <div className="mb-6 relative">
        <div className="flex space-x-4">
          <div className="flex-grow relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              placeholder="Enter a city or address to explore nearby places..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      index === selectedIndex ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {suggestion.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            onClick={handleSearch}
            loading={loading}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {}
      {Object.keys(places).length > 0 && (
        <div className="space-y-8">
          {Object.entries(places).map(([category, categoryPlaces]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-3xl mr-3">{getCategoryIcon(categoryPlaces[0].categories)}</span>
                {category} ({categoryPlaces.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPlaces.map((place) => (
                  <div
                    key={place.place_id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handlePlaceClick(place)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getCategoryIcon(place.categories)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{place.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                        {place.distance && (
                          <p className="text-xs text-gray-500 mt-1">Distance: {Math.round(place.distance)}m</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(places).length === 0 && !loading && searchQuery && !error && (
        <p className="text-gray-500 text-center">No places found. Try a different search term.</p>
      )}

      {}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPlace(null);
          setPlaceDetails(null);
        }}
        title={selectedPlace ? `${selectedPlace.name} - Details` : "Place Details"}
        size="lg"
      >
        <div className="space-y-4">
          {detailsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading place details...</div>
            </div>
          ) : placeDetails ? (
            <>
              {}
              <div>
                <h3 className="text-xl font-semibold mb-2">{placeDetails.name}</h3>
                <p className="text-gray-600 mb-2">{placeDetails.address}</p>
                <p className="text-sm text-blue-600">{getCategoryName(placeDetails.categories)}</p>
                {selectedPlace && selectedPlace.distance !== null && selectedPlace.distance !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">Distance: {Math.round(selectedPlace.distance)}m from {searchQuery}</p>
                )}
              </div>

              {}
              {placeDetails.rating && (
                <div>
                  <span className="font-medium">Rating: </span>
                  <span className="text-yellow-500">⭐ {placeDetails.rating}</span>
                </div>
              )}

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {placeDetails.website && (
                  <div>
                    <span className="font-medium">Website: </span>
                    <a
                      href={placeDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {placeDetails.phone && (
                  <div>
                    <span className="font-medium">Phone: </span>
                    <a href={`tel:${placeDetails.phone}`} className="text-blue-600 hover:underline">
                      {placeDetails.phone}
                    </a>
                  </div>
                )}
                {placeDetails.email && (
                  <div>
                    <span className="font-medium">Email: </span>
                    <a href={`mailto:${placeDetails.email}`} className="text-blue-600 hover:underline">
                      {placeDetails.email}
                    </a>
                  </div>
                )}
              </div>

              {}
              {placeDetails.opening_hours && (
                <div>
                  <span className="font-medium">Opening Hours: </span>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                    {placeDetails.opening_hours}
                  </pre>
                </div>
              )}

              {}
              {placeDetails.description && (
                <div>
                  <span className="font-medium">Description: </span>
                  <p className="text-gray-700 mt-1">{placeDetails.description}</p>
                </div>
              )}

              {}
              {placeDetails.cuisine && (
                <div>
                  <span className="font-medium">Cuisine: </span>
                  <span className="text-gray-700">{placeDetails.cuisine}</span>
                </div>
              )}

              {}
              {placeDetails.price_range && (
                <div>
                  <span className="font-medium">Price Range: </span>
                  <span className="text-gray-700">{placeDetails.price_range}</span>
                </div>
              )}

              {}
              {placeDetails.amenities && placeDetails.amenities.length > 0 && (
                <div>
                  <span className="font-medium">Amenities: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {placeDetails.amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {}
              {placeDetails.photos && placeDetails.photos.length > 0 && (
                <div>
                  <span className="font-medium">Photos: </span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {placeDetails.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${placeDetails.name} ${index + 1}`}
                        
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {placeDetails.error && (
                <p className="text-red-500">{placeDetails.error}</p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No details available for this place.</div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExplorePlaces;
