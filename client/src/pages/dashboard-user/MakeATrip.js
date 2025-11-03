import React, { useState, useEffect } from "react";
import axios from "axios";
import GeoapifyMapWrapper from "../../components/map/GeoapifyMapWrapper";

// API key is now handled by GeoapifyMapWrapper via environment variable

const MakeATrip = () => {
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [distance, setDistance] = useState(0);

  const [route, setRoute] = useState([]);

  // ✅ Convert search text to lat-lon using Geoapify geocoder
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
        name: place.properties.formatted,
        lat: place.geometry.coordinates[1],
        lon: place.geometry.coordinates[0],
      };

      setBucket((prev) => [...prev, newPlace]);
      setSearch("");
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };

  const clearTrip = () => {
    setBucket([]);
    setDistance(0);
    setRoute([]);
  };

  // ✅ Routing Function
  const drawRoute = async (places) => {
    if (places.length < 2) return;

    const waypoints = places.map((p) => `${p.lat},${p.lon}`).join("|");
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

      // Convert GeoJSON to coordinates for Polyline
      // Handle MultiLineString geometry
      let coordinates = [];
      if (routeGeo.type === 'MultiLineString') {
        // Flatten all line segments into a single array
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
    }
  };

  // ✅ Watch bucket changes → update map route
  useEffect(() => {
    if (bucket.length >= 2) {
      drawRoute(bucket);
    } else {
      setRoute([]);
    }
  }, [bucket]);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Panel */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-3">Make a Trip</h2>

        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Enter city or place..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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

        {bucket.map((p, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded mb-2 flex justify-between">
            <span>{p.name}</span>
            <button onClick={() => setBucket(bucket.filter((_, index) => index !== i))} className="text-red-600 font-bold">×</button>
          </div>
        ))}

        <p className="mt-2 font-medium">Road Distance: {distance} km</p>

        <button onClick={clearTrip} className="bg-gray-400 text-white px-4 py-2 rounded mt-3">
          Clear
        </button>
      </div>

      {/* Right Panel (Map) */}
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
  );
};

export default MakeATrip;
