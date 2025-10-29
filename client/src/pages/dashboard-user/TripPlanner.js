import React, { useState, useRef } from 'react';
// ADD BACK useJsApiLoader
import { Autocomplete, Marker, useJsApiLoader } from '@react-google-maps/api';
import { PageLoader } from '../../components/common/Loaders';
import GoogleMapWrapper from '../../components/map/GoogleMapWrapper';
import Button from '../../components/common/Button';
import { useBooking } from '../../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';

const libraries = ['places']; // <-- MUST BE DEFINED

// Default map center (e.g., center of Europe)
const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522,
};

// Close (X) Icon
const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const TripPlanner = () => {
  // --- ADD THIS BACK ---
  // This hook now controls the whole page
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  // --------------------

  const navigate = useNavigate();
  const { createBooking, loading: isCreatingBooking } = useBooking();

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(6);
  const [itinerary, setItinerary] = useState([]); // Array of places { name, lat, lng }
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Ref for the Autocomplete instance
  const autocompleteRef = useRef(null);

  // --- Handlers ---

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const newPlace = {
          name: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        // Update map
        setMapCenter(newPlace);
        setZoom(14);
        // Add to itinerary
        if (!itinerary.find(p => p.name === newPlace.name)) {
          setItinerary([...itinerary, newPlace]);
        }
      } else {
        console.error("No geometry found for place:", place.name);
      }
    }
  };

  const removeFromItinerary = (placeName) => {
    setItinerary(itinerary.filter(p => p.name !== placeName));
  };

  const handleCreateTrip = async () => {
    if (!startDate || !endDate || itinerary.length === 0) {
      alert('Please select at least one destination and set your trip dates.');
      return;
    }

    const mockBookingData = {
      guideId: 'guide_abc_123', // This would come from a "Find Guides" step
      destination: itinerary[0].name, // Use first itinerary item as main destination
      itinerary: itinerary,
      startDate: startDate,
      endDate: endDate,
      totalAmount: 250, // This would be calculated based on guide's price
    };

    try {
      const { booking, clientSecret } = await createBooking(mockBookingData);
      navigate(`/booking/${booking._id}`); // BookingPage will use the clientSecret

    } catch (err) {
      console.error(err);
      alert('Failed to create trip. Please try again.');
    }
  };

  // --- RENDER LOGIC ---

  // We now check for loading and errors at the top level
  if (loadError) return <div className="p-4 text-red-500">Error loading maps. Please check your API key.</div>;
  if (!isLoaded) return <PageLoader text="Loading Trip Planner..." />;

  // This return will only run if isLoaded is true
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
      
      {/* --- Left Panel: Form & Itinerary --- */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow border overflow-y-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Plan Your Trip</h1>
        
        {/* --- Step 1: Form Inputs --- */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search Destinations
            </label>
            {/* This Autocomplete component is now safe to render */}
            <Autocomplete
              onLoad={(ref) => (autocompleteRef.current = ref)}
              onPlaceChanged={handlePlaceSelect}
            >
              <input
                type="text"
                placeholder="Search for cities or landmarks..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </Autocomplete>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>
        </form>

        {/* --- Step 2: Itinerary List --- */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Your Itinerary</h2>
          {itinerary.length === 0 ? (
            <p className="text-gray-500 mt-2">Search for a place to add it to your trip.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {itinerary.map((place, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <span className="font-medium text-gray-700">{place.name}</span>
                  <button onClick={() => removeFromItinerary(place.name)} className="text-gray-400 hover:text-red-500">
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Step 3: Action Button --- */}
        <div className="pt-4 border-t">
          <Button
            size="lg"
            className="w-full"
            onClick={handleCreateTrip}
            loading={isCreatingBooking}
            disabled={itinerary.length === 0 || isCreatingBooking}
          >
            {isCreatingBooking ? 'Creating...' : 'Find Guides & Book'}
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This will proceed to guide selection and payment.
          </p>
        </div>
      </div>

      {/* --- Right Panel: Map --- */}
      <div className="lg:col-span-2 rounded-lg overflow-hidden shadow">
        {/* This wrapper is now safe to render */}
        <GoogleMapWrapper center={mapCenter} zoom={zoom}>
          {itinerary.map((place, index) => (
            <Marker
              key={index}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.name}
            />
          ))}
        </GoogleMapWrapper>
      </div>
    </div>
  );
};

export default TripPlanner;