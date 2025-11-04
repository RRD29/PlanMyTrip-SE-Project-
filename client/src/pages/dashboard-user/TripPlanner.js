import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress, fetchFamousPlaces, fetchRailwayStation, calculateDistance } from '../../utils/geoapify-utils'; // <-- New Geocoding Function
import GeoapifyMapWrapper from '../../components/map/GeoapifyMapWrapper'; // Assuming you kept the original filename
import Button from '../../components/common/Button'; // Assuming you use this Button component
import Modal from '../../components/common/Modal'; // Import Modal component
import { useBooking } from '../../contexts/BookingContext'; // Assuming you use this hook
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

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

    // Autocomplete suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
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

    // Place details modal state
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placeDetails, setPlaceDetails] = useState(null);
    const [placeImages, setPlaceImages] = useState([]);
    const [placeDetailsLoading, setPlaceDetailsLoading] = useState(false);
    const [isPlaceDetailsModalOpen, setIsPlaceDetailsModalOpen] = useState(false);
    const [placeWeather, setPlaceWeather] = useState(null);
    const [placeWeatherLoading, setPlaceWeatherLoading] = useState(false);
    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
    const [selectedWeatherPlace, setSelectedWeatherPlace] = useState(null);
    const [tripDates, setTripDates] = useState([]);


    // --- Handlers ---

    // Fetch autocomplete suggestions
    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await axios.get(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    query
                )}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}&limit=5`
            );

            const features = res.data.features || [];
            const suggestionList = features.map((feature) => ({
                name: feature.properties.formatted,
                lat: feature.geometry.coordinates[1],
                lon: feature.geometry.coordinates[0],
            }));
            setSuggestions(suggestionList);
        } catch (err) {
            console.error("Autocomplete error", err);
            setSuggestions([]);
        }
    };

    // Handle input change with debouncing
    const handleAddressInputChange = (e) => {
        const value = e.target.value;
        setAddressInput(value);
        setShowSuggestions(value.length > 0);

        // Debounce suggestions
        if (value.length > 2) {
            const timeoutId = setTimeout(() => fetchSuggestions(value), 300);
            return () => clearTimeout(timeoutId);
        } else {
            setSuggestions([]);
        }
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion) => {
        setAddressInput(suggestion.name);
        setShowSuggestions(false);
        // Trigger search with the selected suggestion
        const input = suggestion.name;
        const cityDetected = isCity(input);
        setIsCitySearch(cityDetected);

        if (cityDetected) {
            performCitySearch(input, radius);
        } else {
            // Regular geocoding for specific addresses
            handleGeocodeAndAddMarkerFromSuggestion(suggestion);
        }
    };

    // Add marker from suggestion
    const handleGeocodeAndAddMarkerFromSuggestion = async (suggestion) => {
        try {
            setLoading(true);
            setError(null);

            const newPlace = {
                name: suggestion.name,
                lat: suggestion.lat,
                lng: suggestion.lon,
                info: suggestion.name,
                distance: 'N/A', // Not applicable for single place
                budget: Math.floor(Math.random() * 100) + 50, // Mock budget
                accommodation: `Hotel near ${suggestion.name}` // Mock accommodation
            };

            // Update state
            if (!itinerary.find(p => p.name === newPlace.name)) {
                setItinerary(prev => [...prev, newPlace]);
                // Center map on the new place
                setMapCenter([newPlace.lat, newPlace.lng]);
                setZoom(14);
            }

        } catch (err) {
            console.error("Geocoding error", err);
            setError(err.message || 'Error finding places. Please try a different query.');
        } finally {
            setLoading(false);
        }
    };

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
            // First, geocode the city to get its coordinates
            const cityResult = await geocodeAddress(city);

            // Fetch famous places for the city within radius from the city center
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

            // Center map on the city coordinates
            setMapCenter([cityResult.lat, cityResult.lng]);
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
                    // Center map on the new place
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

    // Handle drag and drop reordering
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(itinerary);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setItinerary(items);
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
        // Generate trip dates array
        if (startDate && endDate) {
            const dates = [];
            const start = new Date(startDate);
            const end = new Date(endDate);
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            for (let i = 0; i < totalDays; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                dates.push(date.toISOString().split('T')[0]);
            }
            setTripDates(dates);
        } else {
            setTripDates([]);
        }
    }, [startDate, endDate, itinerary, generateDatedItinerary]);

    // Re-run search when radius changes if a city was previously searched
    useEffect(() => {
        if (lastSearchedCity && radius) {
            performCitySearch(lastSearchedCity, radius);
        }
    }, [radius, lastSearchedCity, performCitySearch]);

    // --- THIS IS THE EDITED FUNCTION ---
    const handleFindGuides = () => {
        if (!lastSearchedCity) {
            alert('Please search for a city destination first.');
            return;
        }

        // Navigate to guides page with the last searched city as query param
        const destination = lastSearchedCity;
        navigate(`/guides?destination=${encodeURIComponent(destination)}`);
    };
    // --- END OF EDIT ---

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

    // Function to fetch place details from Wikipedia
    const fetchPlaceDetails = async (placeName) => {
        setPlaceDetailsLoading(true);
        try {
            // Fetch summary from Wikipedia
            const summaryResponse = await axios.get(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`
            );
            const summary = summaryResponse.data;

            if (summary.type === 'disambiguation' || summary.type === 'no-extract') {
                throw new Error('No detailed information found for this place.');
            }

            setPlaceDetails(summary);

            // Fetch images
            const imageResponse = await axios.get(
                `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(placeName)}&format=json&origin=*`
            );
            const pages = imageResponse.data.query.pages;
            const pageId = Object.keys(pages)[0];
            const imageTitles = pages[pageId].images || [];

            const imagePromises = imageTitles.slice(0, 8).map(async (img) => {
                try {
                    const imgResponse = await axios.get(
                        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(img.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`
                    );
                    const imgPages = imgResponse.data.query.pages;
                    const imgPageId = Object.keys(imgPages)[0];
                    return imgPages[imgPageId].imageinfo?.[0]?.url;
                } catch {
                    return null;
                }
            });

            const imageUrls = (await Promise.all(imagePromises)).filter(url => url !== null);
            setPlaceImages(imageUrls);

        } catch (err) {
            console.error('Error fetching place details:', err);
            setPlaceDetails({ title: placeName, extract: 'No detailed information available for this place.' });
            setPlaceImages([]);
        } finally {
            setPlaceDetailsLoading(false);
        }
    };

    // Function to handle place click
    const handlePlaceClick = (place) => {
        setSelectedPlace(place);
        setIsPlaceDetailsModalOpen(true);
        fetchPlaceDetails(place.name);
    };

    // Function to fetch current weather for a place
    const fetchWeatherForPlace = async (place) => {
        setPlaceWeatherLoading(true);
        try {
            // Geocode the place to get coordinates
            const geoResponse = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(place.name)}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
            );

            if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
                throw new Error('Could not find coordinates for this place');
            }

            const [lng, lat] = geoResponse.data.features[0].geometry.coordinates;

            // Fetch current weather
            const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=bb9b1cc74b30047f0f6662a4725c19ef&units=metric`
            );

            const weatherData = {
                temperature: Math.round(weatherResponse.data.main.temp),
                precipitation: weatherResponse.data.rain ? weatherResponse.data.rain['1h'] || 0 : 0,
                description: weatherResponse.data.weather[0].description,
                icon: weatherResponse.data.weather[0].icon,
                humidity: weatherResponse.data.main.humidity,
                windSpeed: weatherResponse.data.wind.speed
            };

            setPlaceWeather({
                location: place.name,
                weather: weatherData
            });
        } catch (err) {
            console.error('Error fetching weather:', err);
            setPlaceWeather({
                location: place.name,
                weather: {
                    temperature: 'N/A',
                    precipitation: 'N/A',
                    description: 'Weather data unavailable',
                    icon: '01d',
                    humidity: 'N/A',
                    windSpeed: 'N/A'
                }
            });
        } finally {
            setPlaceWeatherLoading(false);
        }
    };

    // Function to handle weather check
    const handleCheckWeather = (place) => {
        setSelectedWeatherPlace(place);
        setIsWeatherModalOpen(true);
        fetchWeatherForPlace(place);
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
                        <div className="flex space-x-2 mt-1 relative">
                            <input
                                type="text"
                                value={addressInput}
                                onChange={handleAddressInputChange}
                                onFocus={() => setShowSuggestions(addressInput.length > 0)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Enter city (e.g., Delhi, Mumbai) or specific address..."
                                disabled={loading}
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            {suggestion.name}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                    ) : (
                        <div className="mt-4">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="itinerary">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-2 max-h-96 overflow-y-auto"
                                        >
                                            {itinerary.map((place, index) => (
                                                <Draggable key={place.name} draggableId={place.name} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`p-3 bg-gray-50 rounded-md border flex items-center justify-between cursor-move ${
                                                                snapshot.isDragging ? 'shadow-lg bg-white' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="text-gray-400">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                                    </svg>
                                                                </div>
                                                                <div className="text-sm text-gray-700 flex-1">
                                                                    <button
                                                                        onClick={() => handlePlaceClick(place)}
                                                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                                                                    >
                                                                        {place.name}
                                                                    </button>
                                                                    {place.imageUrl && (
                                                                        <img src={place.imageUrl} alt={place.name} className="w-full h-32 object-cover rounded-md mt-2" />
                                                                    )}
                                                                    {isCitySearch && (
                                                                        <div className="text-xs text-gray-600 mt-1">
                                                                            <p><strong>Opening Hours:</strong> {place.openingHours}</p>
                                                                            <p><strong>Distance:</strong> {place.distance} km</p>
                                                                            <p><strong>Approx. Budget:</strong> ${place.budget}</p>
                                                                            <p><strong>Accommodation:</strong> {place.accommodation}</p>
                                                                            <button
                                                                                onClick={() => handleCheckWeather(place)}
                                                                                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                                                            >
                                                                                Check Weather
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeFromItinerary(place.name)} className="text-gray-400 hover:text-red-500 ml-2">
                                                                <CloseIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            {datedItinerary.length === 0 && (
                                <p className="text-gray-500 mt-2">Set start and end dates to see the dated plan.</p>
                            )}
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
                            onClick={handleFindGuides}
                            disabled={itinerary.length === 0}
                        >
                            Find Guides
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

            {/* --- Weather Modal --- */}
            <Modal
                isOpen={isWeatherModalOpen}
                onClose={() => {
                    setIsWeatherModalOpen(false);
                    setSelectedWeatherPlace(null);
                    setPlaceWeather(null);
                }}
                title={selectedWeatherPlace ? `${selectedWeatherPlace.name} - Current Weather` : "Weather Information"}
                size="lg"
            >
                <div className="space-y-4">
                    {placeWeatherLoading ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500">Loading weather data...</div>
                        </div>
                    ) : placeWeather && placeWeather.weather ? (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-center">{placeWeather.location}</h3>
                            <div className="bg-blue-50 p-6 rounded-lg border text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${placeWeather.weather.icon}@2x.png`}
                                        alt={placeWeather.weather.description}
                                        className="w-16 h-16"
                                    />
                                </div>
                                <div className="mb-4">
                                    <p className="text-3xl font-bold text-blue-600">{placeWeather.weather.temperature}°C</p>
                                    <p className="text-lg text-gray-700 capitalize">{placeWeather.weather.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium">Precipitation</p>
                                        <p>{placeWeather.weather.precipitation} mm</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Humidity</p>
                                        <p>{placeWeather.weather.humidity}%</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Wind Speed</p>
                                        <p>{placeWeather.weather.windSpeed} m/s</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Last Updated</p>
                                        <p>{new Date().toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-500">Weather data not available for this location.</div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* --- Place Details Modal --- */}
            <Modal
                isOpen={isPlaceDetailsModalOpen}
                onClose={() => {
                    setIsPlaceDetailsModalOpen(false);
                    setSelectedPlace(null);
                    setPlaceDetails(null);
                    setPlaceImages([]);
                }}
                title={selectedPlace ? `${selectedPlace.name} - Details` : "Place Details"}
                size="xl"
            >
                <div className="space-y-4">
                    {placeDetailsLoading ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500">Loading place details...</div>
                        </div>
                    ) : placeDetails ? (
                        <>
                            {/* Place Images */}
                            {placeImages.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {placeImages.map((imageUrl, index) => (
                                            <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${placeDetails.title} image ${index + 1}`}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Place Description */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">About {placeDetails.title}</h3>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed">{placeDetails.extract}</p>
                                </div>
                            </div>

                            {/* Wikipedia Link */}
                            {placeDetails.content_urls?.desktop?.page && (
                                <div className="pt-4 border-t">
                                    <a
                                        href={placeDetails.content_urls.desktop.page}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Read more on Wikipedia
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-500">No details available for this place.</div>
                        </div>
                    )}
                </div>
            </Modal>

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