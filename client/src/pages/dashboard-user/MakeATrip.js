import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import GeoapifyMapWrapper from "../../components/map/GeoapifyMapWrapper";
import { calculateDistance } from "../../utils/geoapify-utils";



const MakeATrip = () => {
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [distance, setDistance] = useState(0);

  const [route, setRoute] = useState([]);

  const [itinerary, setItinerary] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(value.length > 0);

    
    if (value.length > 2) {
      const timeoutId = setTimeout(() => fetchSuggestions(value), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  };

  
  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.name);
    setShowSuggestions(false);
    handleAddPlaceFromSuggestion(suggestion);
  };

  
  const handleAddPlace = async () => {
    if (!search.trim()) return;

    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          search
        )}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
      );

      const place = res.data.features?.[0];
      if (!place) return alert("Location not found!");

      const newPlace = {
        id: Date.now(),
        name: place.properties.formatted,
        lat: place.geometry.coordinates[1],
        lon: place.geometry.coordinates[0],
      };

      setBucket((prev) => {
        const updated = [...prev, newPlace];
        
        if (updated.length >= 2) {
          drawRoute(updated);
        }
        return updated;
      });
      setSearch("");
      setShowSuggestions(false);
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };

  
  const handleAddPlaceFromSuggestion = async (suggestion) => {
    const newPlace = {
      id: Date.now(),
      name: suggestion.name,
      lat: suggestion.lat,
      lon: suggestion.lon,
    };

    setBucket((prev) => {
      const updated = [...prev, newPlace];
      
      if (updated.length >= 2) {
        drawRoute(updated);
      }
      return updated;
    });
    setSearch("");
    setShowSuggestions(false);
  };

  const clearTrip = () => {
    setBucket([]);
    setDistance(0);
    setRoute([]);
    setItinerary([]);
    setShowItinerary(false);
  };

  // Handle shortest path calculation
  const handleShortestPath = async () => {
    if (bucket.length < 2) return alert("Add at least 2 places to calculate shortest path.");

    let current;
    try {
      // Try geolocation first
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      current = {
        name: "Your Current Location",
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
    } catch (err) {
      
      const currentLocation = prompt("Enter your current location:");
      if (!currentLocation) return;

      try {
        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            currentLocation
          )}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
        );

        const place = res.data.features?.[0];
        if (!place) return alert("Current location not found!");

        current = {
          name: place.properties.formatted,
          lat: place.geometry.coordinates[1],
          lon: place.geometry.coordinates[0],
        };
      } catch (geocodeErr) {
        console.error("Geocoding error", geocodeErr);
        return alert("Failed to geocode current location.");
      }
    }

    
    const remaining = [...bucket];
    const optimizedBucket = [];
    let currentPoint = current;

    while (remaining.length > 0) {
      let closestIndex = 0;
      let minDistance = calculateDistance(currentPoint.lat, currentPoint.lon, remaining[0].lat, remaining[0].lon);

      for (let i = 1; i < remaining.length; i++) {
        const dist = calculateDistance(currentPoint.lat, currentPoint.lon, remaining[i].lat, remaining[i].lon);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      }

      const nextPlace = remaining.splice(closestIndex, 1)[0];
      optimizedBucket.push(nextPlace);
      currentPoint = nextPlace;
    }

    
    setBucket(optimizedBucket);

    
    const fullItinerary = [current, ...optimizedBucket];
    setItinerary(fullItinerary);
    setShowItinerary(true);

    
    drawRoute(optimizedBucket, current);
  };

  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(bucket);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBucket(items);
    
    if (items.length >= 2) {
      drawRoute(items);
    }
  };

  
  const drawRoute = async (places, start = null) => {
    const allPlaces = start ? [start, ...places] : places;
    if (allPlaces.length < 2) return;

    const waypoints = allPlaces.map((p) => `${p.lat},${p.lon}`).join("|");
    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`;

    try {
      console.log("Fetching route from:", url);
      const res = await fetch(url);
      const data = await res.json();

      console.log("Route API response:", data);

      if (!data.features || !data.features.length) {
        console.error("No route features found");
        return;
      }

      const routeGeo = data.features[0].geometry;
      const km = (data.features[0].properties.distance / 1000).toFixed(2);
      setDistance(km);

      
      
      let coordinates = [];
      if (routeGeo.type === 'MultiLineString') {
        
        coordinates = routeGeo.coordinates.flat().map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));
      } else if (routeGeo.type === 'LineString') {
        coordinates = routeGeo.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));
      }

      console.log("Setting route coordinates:", coordinates.length, "points");
      setRoute(coordinates);
    } catch (error) {
      console.error("Routing error:", error);
      
      setRoute([]);
    }
  };

  
  useEffect(() => {
    setBucket(prev => prev.map((p, i) => p.id ? p : { ...p, id: Date.now() + i }));
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-3">Make a Trip</h2>

          <div className="relative mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Enter city or place..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(search.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
          </div>

          <button
            onClick={handleAddPlace}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
          >
            Add
          </button>

          <input
            type="date"
            className="border p-2 rounded w-full mb-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded w-full mb-3"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <h3 className="font-semibold mb-2">Bucket ({bucket.length})</h3>

          <Droppable droppableId="bucket">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {bucket.map((p, i) => (
                  <Draggable key={p.id} draggableId={p.id.toString()} index={i}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-100 p-2 rounded mb-2 flex justify-between cursor-move"
                      >
                        <span>{p.name}</span>
                        <button onClick={() => setBucket(bucket.filter((_, index) => index !== i))} className="text-red-600 font-bold">×</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <p className="mt-2 font-medium">Road Distance: {distance} km</p>

          {showItinerary && itinerary.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Optimized Itinerary</h3>
              <ol className="list-decimal list-inside space-y-1">
                {itinerary.map((place, index) => (
                  <li key={index} className="text-gray-700">
                    {place.name}
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setShowItinerary(false)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Hide Itinerary
              </button>
            </div>
          )}

          <button onClick={clearTrip} className="bg-gray-400 text-white px-4 py-2 rounded mt-3 mr-2">
            Clear
          </button>

          <button onClick={handleShortestPath} className="bg-green-600 text-white px-4 py-2 rounded mt-3">
            Shortest Path
          </button>
        </div>

        {}
        <div className="h-[520px] rounded-lg overflow-hidden shadow">
          <GeoapifyMapWrapper
            center={bucket[0] ? [bucket[0].lat, bucket[0].lon] : [28.6139, 77.2090]}
            zoom={11}
            markers={bucket.map((p, i) => ({
              lat: p.lat,
              lng: p.lon,
              info: p.name
            }))}
            route={route}
          />
        </div>
      </div>
    </DragDropContext>
  );
};

export default MakeATrip;
