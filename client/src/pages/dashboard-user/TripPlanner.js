import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress, fetchFamousPlaces, fetchRailwayStation, calculateDistance } from '../../utils/geoapify-utils'; // <-- New Geocoding Function
import GeoapifyMapWrapper from '../../components/map/GeoapifyMapWrapper'; // Assuming you kept the original filename
import Button from '../../components/common/Button'; // Assuming you use this Button component
import Modal from '../../components/common/Modal'; // Import Modal component
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
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // State for schedule modal
    const [isEditMode, setIsEditMode] = useState(false); // State for edit mode
    const [editableSchedules, setEditableSchedules] = useState([]); // State for editable schedules
    const [savedSchedules, setSavedSchedules] = useState([]); // State for saved edited schedules

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
    const performCitySearch = useCallback(async (city, rad) => {
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
    }, []);

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
    const generateDatedItinerary = useCallback(() => {
        if (!startDate || !endDate || itinerary.length === 0) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Inclusive days

        const totalPlaces = itinerary.length;
        const basePlacesPerDay = Math.floor(totalPlaces / totalDays);
        const extraPlaces = totalPlaces % totalDays;

        const datedPlan = [];

        let placeIndex = 0;
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            // Distribute extra places to the first 'extraPlaces' days
            const placesForThisDay = basePlacesPerDay + (i < extraPlaces ? 1 : 0);
            const dayPlaces = itinerary.slice(placeIndex, placeIndex + placesForThisDay);
            placeIndex += placesForThisDay;

            datedPlan.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                places: dayPlaces
            });
        }

        setDatedItinerary(datedPlan);
    }, [startDate, endDate, itinerary]);

    // Generate dated itinerary when dates or itinerary change
    useEffect(() => {
        generateDatedItinerary();
    }, [startDate, endDate, itinerary, generateDatedItinerary]);

    // Re-run search when radius changes if a city was previously searched
    useEffect(() => {
        if (lastSearchedCity && radius) {
            performCitySearch(lastSearchedCity, radius);
        }
    }, [radius, lastSearchedCity, performCitySearch]);

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
            const { booking } = await createBooking(mockBookingData);
            navigate(`/booking/${booking._id}`);

        } catch (err) {
            console.error(err);
            alert('Failed to create trip. Please try again.');
        }
    };

    // Function to initialize editable schedules
    const initializeEditableSchedules = () => {
        const schedules = datedItinerary.map(day => ({
            date: day.date,
            schedule: generateDaySchedule(day)
        }));
        setEditableSchedules(schedules);
    };

    // Function to handle edit mode toggle
    const handleEditToggle = () => {
        if (!isEditMode) {
            // Entering edit mode: initialize editable schedules
            initializeEditableSchedules();
        } else {
            // Exiting edit mode: save the changes
            setSavedSchedules([...editableSchedules]);
        }
        setIsEditMode(!isEditMode);
    };

    // Function to update editable schedule
    const updateScheduleItem = (dayIndex, itemIndex, field, value) => {
        const updatedSchedules = [...editableSchedules];
        updatedSchedules[dayIndex].schedule[itemIndex][field] = value;
        setEditableSchedules(updatedSchedules);
    };

    // Function to add a new schedule item
    const addScheduleItem = (dayIndex, insertIndex) => {
        const updatedSchedules = [...editableSchedules];
        const newItem = { time: '12:00', activity: 'New Activity' };
        updatedSchedules[dayIndex].schedule.splice(insertIndex + 1, 0, newItem);
        setEditableSchedules(updatedSchedules);
    };

    // Function to remove a schedule item
    const removeScheduleItem = (dayIndex, itemIndex) => {
        const updatedSchedules = [...editableSchedules];
        updatedSchedules[dayIndex].schedule.splice(itemIndex, 1);
        setEditableSchedules(updatedSchedules);
    };

    // Function to download schedule as text file
    const downloadSchedule = () => {
        const schedulesToDownload = savedSchedules.length > 0 ? savedSchedules : datedItinerary.map(day => ({
            date: day.date,
            schedule: generateDaySchedule(day)
        }));

        let content = 'Trip Schedule\n\n';
        schedulesToDownload.forEach(day => {
            content += `${new Date(day.date).toDateString()}\n`;
            content += '='.repeat(50) + '\n';
            day.schedule.forEach(item => {
                content += `${item.time} - ${item.activity}\n`;
            });
            content += '\n';
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trip-schedule-${startDate}-to-${endDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Prepare markers for the GeoapifyMapWrapper
    const mapMarkers = itinerary.map(place => ({
        lat: place.lat,
        lng: place.lng,
        info: place.name // Passed as the popup content
    }));

    // Function to generate day-wise schedule
    const generateDaySchedule = (day) => {
        const schedule = [];
        const places = day.places;

        // Breakfast at 8 AM
        schedule.push({ time: '08:00', activity: 'Breakfast' });

        // Start journey at 9 AM
        schedule.push({ time: '09:00', activity: 'Start Journey' });

        let currentTime = 9 * 60; // 9 AM in minutes
        let lunchInserted = false;

        places.forEach((place, index) => {
            // Estimate travel time based on distance (10-30 min per km, min 15 min)
            const distance = place.distance ? parseFloat(place.distance) : 0;
            const travelTime = Math.max(15, Math.min(30 + distance * 5, 120)); // 5 min per km, cap at 2 hours
            currentTime += travelTime;

            // Round time
            const arrivalTime = Math.round(currentTime);
            const hours = Math.floor(arrivalTime / 60);
            const minutes = arrivalTime % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            schedule.push({ time: timeString, activity: `Arrive at ${place.name}` });

            // Add visit time (assume 1-2 hours per place)
            const visitTime = 90; // 1.5 hours
            currentTime += visitTime;

            // Insert lunch around 12-1 PM if not inserted and time is appropriate
            if (!lunchInserted && currentTime >= 12 * 60 && currentTime <= 13 * 60) {
                schedule.push({ time: '12:30', activity: 'Lunch' });
                lunchInserted = true;
                currentTime = Math.max(currentTime, 13 * 60); // Ensure time moves to after lunch
            }
        });

        // If lunch not inserted, add it at 12:30
        if (!lunchInserted) {
            schedule.push({ time: '12:30', activity: 'Lunch' });
        }

        // Add afternoon activities or free time if schedule ends early
        if (currentTime < 17 * 60) { // Before 5 PM
            schedule.push({ time: '15:00', activity: 'Free time / Afternoon activities' });
        }

        // Dinner at 7 PM
        schedule.push({ time: '19:00', activity: 'Dinner' });

        // Sort schedule by time
        return schedule.sort((a, b) => a.time.localeCompare(b.time));
    };

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

                {/* --- Step 3: Action Buttons --- */}
                <div className="pt-4 border-t space-y-3">
                    <div className="flex space-x-3">
                        <Button
                            size="lg"
                            className="flex-1"
                            onClick={() => setIsScheduleModalOpen(true)}
                            disabled={datedItinerary.length === 0}
                        >
                            Day to Day Schedule
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1"
                            onClick={handleCreateTrip}
                            loading={isCreatingBooking}
                            disabled={itinerary.length === 0 || isCreatingBooking || !startDate || !endDate}
                        >
                            {isCreatingBooking ? 'Creating...' : 'Find Guides & Book'}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        View your day-wise schedule or proceed to guide selection and payment.
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

            {/* --- Schedule Modal --- */}
            <Modal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                title="Day to Day Schedule"
                size="xl"
            >
                <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <button
                                onClick={handleEditToggle}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                {isEditMode ? 'Save Edits' : 'Edit Schedule'}
                            </button>
                            <button
                                onClick={downloadSchedule}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                                Download Schedule
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">
                            {isEditMode ? 'Editing mode: Click on any time or activity to edit' : 'View mode'}
                        </span>
                    </div>

                    {/* Schedule Content */}
                    <div className="max-h-96 overflow-y-auto space-y-6">
                        {(isEditMode ? editableSchedules : (savedSchedules.length > 0 ? savedSchedules : datedItinerary.map(day => ({
                            date: day.date,
                            schedule: generateDaySchedule(day)
                        })))).map((day, dayIndex) => (
                            <div key={dayIndex} className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {new Date(day.date).toDateString()}
                                </h3>
                                <div className="space-y-2">
                                    {day.schedule.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center space-x-4">
                                            {isEditMode ? (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={item.time}
                                                        onChange={(e) => updateScheduleItem(dayIndex, itemIndex, 'time', e.target.value)}
                                                        className="font-medium text-gray-700 w-20 px-2 py-1 border rounded"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.activity}
                                                        onChange={(e) => updateScheduleItem(dayIndex, itemIndex, 'activity', e.target.value)}
                                                        className="text-gray-600 flex-1 px-2 py-1 border rounded"
                                                    />
                                                    <button
                                                        onClick={() => addScheduleItem(dayIndex, itemIndex)}
                                                        className="text-green-500 hover:text-green-700 p-1"
                                                        title="Add new item below"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => removeScheduleItem(dayIndex, itemIndex)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove this item"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-700 w-16">{item.time}</span>
                                                    <span className="text-gray-600">{item.activity}</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TripPlanner;