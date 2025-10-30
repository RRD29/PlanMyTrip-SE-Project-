import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress, fetchFamousPlaces, fetchRailwayStation, calculateDistance } from '../../utils/geoapify-utils'; // <-- New Geocoding Function
import GeoapifyMapWrapper from '../../components/map/GeoapifyMapWrapper'; // Assuming you kept the original filename
import Button from '../../components/common/Button'; // Assuming you use this Button component
import { useBooking } from '../../contexts/BookingContext'; // Assuming you use this hook

// Default map center (e.g., center of the US)
const initialCenter = [39.8283, -98.5795]; 

// Close (X) Icon - If needed for the itinerary list
const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const TripPlanner = () => {
    const navigate = useNavigate();
    const { createBooking, loading: isCreatingBooking } = useBooking();

    // State for the simple input field
    const [addressInput, setAddressInput] = useState('');
    
    // State to manage map view and markers
    const [mapCenter, setMapCenter] = useState(initialCenter);
    const [zoom, setZoom] = useState(4); // Low zoom for initial view
    const [itinerary, setItinerary] = useState([]); // Array of places { name, lat, lng, info, distance, budget, accommodation, openingHours }
    const [datedItinerary, setDatedItinerary] = useState([]); // Array of { date, places: [] }

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastSearchedCity, setLastSearchedCity] = useState(''); // Track last searched city

    // Form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [radius, setRadius] = useState('10'); // Default radius in km
    const [isCitySearch, setIsCitySearch] = useState(false); // Flag to detect city search


    // --- Handlers ---

    // Helper function to detect if input is a city
    const isCity = (input) => {
        const cityKeywords = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan-dombivli', 'vasai-virar', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'howrah', 'ranchi', 'jabalpur', 'gwalior', 'coimbatore', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur', 'hubli-dharwad', 'bareilly', 'moradabad', 'mysore', 'gurgaon', 'aligarh', 'jalandhar', 'tiruchirappalli', 'bhubaneswar', 'salem', 'warangal', 'guntur', 'bhiwandi', 'saharanpur', 'gorakhpur', 'bikaner', 'amravati', 'noida', 'jamshedpur', 'bhilai', 'cuttack', 'firozabad', 'kochi', 'bhavnagar', 'dehradun', 'durgapur', 'asansol', 'nanded', 'kolhapur', 'ajmer', 'gulbarga', 'jamnagar', 'ujjain', 'loni', 'siliguri', 'jhansi', 'ulhasnagar', 'nellore', 'jammu', 'mangalore', 'erode', 'belgaum', 'ambattur', 'tirunelveli', 'malegaon', 'gaya', 'jalgaon', 'udaipur', 'maheshtala', 'tiruppur', 'davanagere', 'kozhikode', 'akola', 'kurnool', 'rajpur sonarpur', 'bokaro', 'south dum dum', 'bellary', 'patiala', 'gopalpur', 'agartala', 'dhule', 'bhagalpur', 'latur', 'muzaffarpur', 'mathura', 'kamarhati', 'sambalpur', 'parbhani', 'allahabad', 'bihar sharif', 'burhanpur', 'singrauli', 'nadiad', 'secunderabad', 'nashik', 'shimla', 'haridwar', 'rourkela', 'panchkula', 'darbhanga', 'silchar', 'ambala', 'ongole', 'nandyal', 'cuddalore', 'ratlam', 'kharagpur', 'dindigul', 'panihati', 'katni', 'smvd', 'bhuj', 'rewari', 'mirzapur', 'korba', 'raichur', 'bidar', 'madhyamgram', 'harihar', 'davanagere', 'kottayam', 'kollam', 'nellore', 'tiruvottiyur', 'pondicherry', 'barasat', 'alwar', 'jhunjhunun', 'puri', 'rohtak', 'raiganj', 'sirsa', 'kishanganj', 'gangtok', 'shimla', 'panaji', 'imphal', 'shillong', 'aizawl', 'kohima', 'itanagar', 'dispur', 'port blair', 'daman', 'diu', 'silvassa', 'leh', 'kargil', 'srinagar', 'jammu', 'chandigarh', 'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad', 'pune', 'ahmedabad', 'surat', 'lucknow', 'kanpur', 'nagpur', 'patna', 'indore', 'vadodara', 'bhopal', 'coimbatore', 'ludhiana', 'agra', 'madurai', 'nashik', 'faridabad', 'meerut', 'rajkot', 'jabalpur', 'asansol', 'allahabad', 'amritsar', 'allahabad', 'dhanbad', 'ranchi', 'howrah', 'jodhpur', 'raipur', 'kota', 'guwahati', 'solapur', 'hubli', 'bareilly', 'moradabad', 'aligarh', 'jalandhar', 'tiruchirappalli', 'bhubaneswar', 'salem', 'warangal', 'guntur', 'gorakhpur', 'bikaner', 'amravati', 'jamshedpur', 'bhilai', 'cuttack', 'firozabad', 'kochi', 'bhavnagar', 'dehradun', 'durgapur', 'nanded', 'kolhapur', 'ajmer', 'gulbarga', 'jamnagar', 'ujjain', 'siliguri', 'jhansi', 'ulhasnagar', 'jammu', 'mangalore', 'erode', 'belgaum', 'tirunelveli', 'malegaon', 'gaya', 'jalgaon', 'udaipur', 'tiruppur', 'davanagere', 'kozhikode', 'akola', 'kurnool', 'bokaro', 'patiala', 'dhule', 'bhagalpur', 'latur', 'muzaffarpur', 'mathura', 'sambalpur', 'parbhani', 'bihar sharif', 'burhanpur', 'singrauli', 'nadiad', 'secunderabad', 'shimla', 'haridwar', 'rourkela', 'panchkula', 'darbhanga', 'silchar', 'ambala', 'ongole', 'nandyal', 'cuddalore', 'ratlam', 'kharagpur', 'dindigul', 'katni', 'bhuj', 'rewari', 'mirzapur', 'korba', 'raichur', 'bidar', 'harihar', 'kottayam', 'kollam', 'tiruvottiyur', 'pondicherry', 'barasat', 'alwar', 'jhunjhunun', 'puri', 'rohtak', 'raiganj', 'sirsa', 'kishanganj', 'gangtok', 'panaji', 'imphal', 'shillong', 'aizawl', 'kohima', 'itanagar', 'dispur', 'port blair', 'daman', 'diu', 'silvassa', 'leh', 'kargil'];
        const lowerInput = input.toLowerCase();
        return cityKeywords.some(keyword => lowerInput.includes(keyword)) || lowerInput.split(',').length === 1; // Simple heuristic: if no comma, likely a city
    };

    // Refactored search function
    const performCitySearch = async (city, rad) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch famous places for the city within radius from railway station
            const places = await fetchFamousPlaces(city, 10, parseInt(rad)); // Fetch up to 10 places within radius

            if (places.length === 0) {
                throw new Error('No famous places found for this city.');
            }

            // Calculate distances between places (assuming sequential visit)
            const placesWithDistances = places.map((place, index) => {
                let distance = 0;
                if (index > 0) {
                    const prevPlace = places[index - 1];
                    distance = calculateDistance(prevPlace.lat, prevPlace.lng, place.lat, place.lng);
                }
                return {
                    ...place,
                    distance: distance.toFixed(2), // Distance in km
                    budget: Math.floor(Math.random() * 100) + 50, // Mock budget per place
                    accommodation: `Hotel near ${place.name}`, // Mock accommodation
                    openingHours: place.openingHours // Include opening hours
                };
            });

            // Clear existing itinerary and add new places
            setItinerary(placesWithDistances);

            // Center map on the railway station
            const station = await fetchRailwayStation(city);
            setMapCenter([station.lat, station.lng]);
            setZoom(12); // Zoom out a bit to show multiple places

            setLastSearchedCity(city);

        } catch (err) {
            console.error("Search failed:", err);
            setError(err.message || 'Error finding places. Please try a different query.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeocodeAndAddMarker = async () => {
        if (!addressInput.trim()) return;

        const input = addressInput.trim();
        const cityDetected = isCity(input);
        setIsCitySearch(cityDetected);

        if (cityDetected) {
            await performCitySearch(input, radius);
        } else {
            // Regular geocoding for specific addresses
            try {
                setLoading(true);
                setError(null);

                const result = await geocodeAddress(input);

                const newPlace = {
                    name: result.fullAddress,
                    lat: result.lat,
                    lng: result.lng,
                    info: result.fullAddress,
                    distance: 'N/A', // Not applicable for single place
                    budget: Math.floor(Math.random() * 100) + 50, // Mock budget
                    accommodation: `Hotel near ${result.fullAddress}` // Mock accommodation
                };

                // Update state
                if (!itinerary.find(p => p.name === newPlace.name)) {
                    setItinerary(prev => [...prev, newPlace]);
                    setMapCenter([newPlace.lat, newPlace.lng]);
                    setZoom(14);
                }

            } catch (err) {
                console.error("Search failed:", err);
                setError(err.message || 'Error finding places. Please try a different query.');
            } finally {
                setLoading(false);
            }
        }

        setAddressInput('');
    };

    const removeFromItinerary = (placeName) => {
        const newItinerary = itinerary.filter(p => p.name !== placeName);
        setItinerary(newItinerary);
        // Recenter map after removal if list isn't empty
        if (newItinerary.length > 0) {
            const lastPlace = newItinerary[newItinerary.length - 1];
            setMapCenter([lastPlace.lat, lastPlace.lng]);
        } else {
            setMapCenter(initialCenter);
            setZoom(4);
        }
    };

    // Function to generate dated itinerary
    const generateDatedItinerary = () => {
        if (!startDate || !endDate || itinerary.length === 0) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Inclusive days

        const placesPerDay = Math.ceil(itinerary.length / totalDays);
        const datedPlan = [];

        for (let i = 0; i < totalDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dayPlaces = itinerary.slice(i * placesPerDay, (i + 1) * placesPerDay);
            datedPlan.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                places: dayPlaces
            });
        }

        setDatedItinerary(datedPlan);
    };

    // Generate dated itinerary when dates or itinerary change
    useEffect(() => {
        generateDatedItinerary();
    }, [startDate, endDate, itinerary]);

    // Re-run search when radius changes if a city was previously searched
    useEffect(() => {
        if (lastSearchedCity && radius) {
            performCitySearch(lastSearchedCity, radius);
        }
    }, [radius]);

    const handleCreateTrip = async () => {
        if (!startDate || !endDate || itinerary.length === 0) {
            alert('Please select at least one destination and set your trip dates.');
            return;
        }

        const mockBookingData = {
            guideId: '6902625ed7c12a36953fe528', // Real guide ID from database
            tripDetails: {
                destination: itinerary[0].name,
                startDate: startDate,
                endDate: endDate,
                itinerary: itinerary.map(({ name, lat, lng }) => ({ name, lat, lng })), // Ensure clean data for backend
            },
            startDate: startDate,
            endDate: endDate,
            totalAmount: 250,
        };

        try {
            const { booking, clientSecret } = await createBooking(mockBookingData);
            navigate(`/booking/${booking._id}`);

        } catch (err) {
            console.error(err);
            alert('Failed to create trip. Please try again.');
        }
    };

    // Prepare markers for the GeoapifyMapWrapper
    const mapMarkers = itinerary.map(place => ({
        lat: place.lat,
        lng: place.lng,
        info: place.name // Passed as the popup content
    }));

    // --- RENDER LOGIC ---
    // Note: We no longer need to check isLoaded or loadError from Google's useJsApiLoader
    // since we're using a simple HTML input and Geoapify/Leaflet.

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
            
            {/* --- Left Panel: Form & Itinerary --- */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow border overflow-y-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Plan Your Trip</h1>
                
                {/* --- Step 1: Form Inputs (Replaced Google Autocomplete) --- */}
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGeocodeAndAddMarker(); }}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Search Destinations
                        </label>
                        <div className="flex space-x-2 mt-1">
                            <input
                                type="text"
                                value={addressInput}
                                onChange={(e) => setAddressInput(e.target.value)}
                                placeholder="Enter city (e.g., Delhi, Mumbai) or specific address..."
                                disabled={loading}
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Button
                                onClick={handleGeocodeAndAddMarker}
                                loading={loading}
                                disabled={loading || !addressInput.trim()}
                                type="button" // Important to prevent form submission if not ready
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                        {isCitySearch && itinerary.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">City search detected! Added famous places with distances, budget, and accommodation.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date Inputs */}
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Radius (km)</label>
                        <input
                            type="number"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            placeholder="Enter radius in km"
                            min="1"
                            max="50"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
                        />
                    </div>
                </form>

                {/* --- Step 2: Itinerary List --- */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Your Itinerary ({itinerary.length})</h2>
                    {itinerary.length === 0 ? (
                        <p className="text-gray-500 mt-2">Search for a city or place to add to your trip.</p>
                    ) : datedItinerary.length === 0 ? (
                        <p className="text-gray-500 mt-2">Set start and end dates to see the dated plan.</p>
                    ) : (
                        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                            {datedItinerary.map((day, dayIndex) => (
                                <div key={dayIndex} className="p-3 bg-gray-50 rounded-md border">
                                    <h3 className="font-semibold text-gray-800">{new Date(day.date).toDateString()}</h3>
                                    <ul className="mt-2 space-y-2">
                                        {day.places.map((place, placeIndex) => (
                                            <li key={placeIndex} className="flex items-center justify-between">
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">{place.name}</span>
                                                    {place.imageUrl && (
                                                        <img src={place.imageUrl} alt={place.name} className="w-full h-32 object-cover rounded-md mt-2" />
                                                    )}
                                                    {isCitySearch && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            <p><strong>Opening Hours:</strong> {place.openingHours}</p>
                                                            <p><strong>Distance:</strong> {place.distance} km</p>
                                                            <p><strong>Approx. Budget:</strong> ${place.budget}</p>
                                                            <p><strong>Accommodation:</strong> {place.accommodation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => removeFromItinerary(place.name)} className="text-gray-400 hover:text-red-500">
                                                    <CloseIcon className="w-5 h-5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Step 3: Action Button --- */}
                <div className="pt-4 border-t">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleCreateTrip}
                        loading={isCreatingBooking}
                        disabled={itinerary.length === 0 || isCreatingBooking || !startDate || !endDate}
                    >
                        {isCreatingBooking ? 'Creating...' : 'Find Guides & Book'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        This will proceed to guide selection and payment.
                    </p>
                </div>
            </div>

            {/* --- Right Panel: Map (Geoapify) --- */}
            <div className="lg:col-span-2 rounded-lg overflow-hidden shadow">
                {/* Use GeoapifyMapWrapper and pass the cleaned marker data */}
                <GeoapifyMapWrapper 
                    center={mapCenter} // Array [lat, lng]
                    zoom={zoom}
                    markers={mapMarkers}
                />
            </div>
        </div>
    );
};

export default TripPlanner;