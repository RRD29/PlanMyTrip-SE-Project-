// client/src/utils/geoapify-utils.js

import axios from 'axios';

// Get the Geoapify API key from environment variables
const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;

/**
 * Converts a text address into geographic coordinates (latitude, longitude)
 * using the Geoapify Geocoding API.
 * @param {string} address The address to geocode.
 * @returns {Promise<object>} An object with { lat, lng } or throws an error.
 */
export const geocodeAddress = async (address) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  // Geoapify Geocoding API endpoint
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      // Use the first (most confident) result
      const feature = features[0];

      // Geoapify returns coordinates as [longitude, latitude]. We need to swap them.
      const [lng, lat] = feature.geometry.coordinates;

      return {
          lat,
          lng,
          fullAddress: feature.properties.formatted, // Use the formatted address
          confidence: feature.properties.confidence
      };
    }

    // If no results are found
    throw new Error('Address not found or no valid features returned.');

  } catch (error) {
    console.error('Geoapify Geocoding Error:', error.message || error);
    // Re-throw a generic error for the calling function to handle
    throw new Error(`Failed to geocode address: ${address}`);
  }
};

/**
 * Fetches the main railway station for a given city.
 * @param {string} city The city name.
 * @returns {Promise<object>} Railway station data { lat, lng, name }.
 */
export const fetchRailwayStation = async (city) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  // First, geocode the city to get its coordinates
  const cityData = await geocodeAddress(city);
  const { lat, lng } = cityData;

  // Search for railway stations
  const url = `https://api.geoapify.com/v2/places?categories=building.transportation.train_station&filter=circle:${lng},${lat},20000&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      // Assume the first one is the main station
      const station = features[0];
      const [lng, lat] = station.geometry.coordinates;
      return {
        lat,
        lng,
        name: station.properties.name || 'Main Railway Station'
      };
    }

    // Fallback to city center if no station found
    return { lat: cityData.lat, lng: cityData.lng, name: 'City Center' };
  } catch (error) {
    console.error('Geoapify Railway Station Error:', error.message);
    // Fallback to city center
    return { lat: cityData.lat, lng: cityData.lng, name: 'City Center' };
  }
};

/**
 * Fetches famous places (POIs) for a given city using Geoapify Places API, centered on railway station within radius.
 * @param {string} city The city name to search for places.
 * @param {number} limit Number of places to fetch (default 10).
 * @param {number} radius Radius in km (default 10).
 * @returns {Promise<Array>} Array of place objects with { name, lat, lng, category, address, openingHours }.
 */
export const fetchFamousPlaces = async (city, limit = 10, radius = 10) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  // First, find the main railway station
  const station = await fetchRailwayStation(city);
  const { lat, lng } = station;

  // Convert radius to meters
  const radiusMeters = radius * 1000;

  // Geoapify Places API endpoint for POIs, sorted by popularity
  const url = `https://api.geoapify.com/v2/places?categories=tourism.sights,entertainment,leisure,religion,building.historic&filter=circle:${lng},${lat},${radiusMeters}&limit=20&sort=popularity&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      const places = [];
      let museumCount = 0;
      let parkCount = 0;
      for (const feature of features) {
        const [lng, lat] = feature.geometry.coordinates;
        const placeId = feature.properties.place_id;
        const name = feature.properties.name || 'Unnamed Place';
        const categories = feature.properties.categories || [];
        const rawData = feature.properties.datasource?.raw || {};

        // Assign priority based on categories
        let priority = 10; // Default low priority
        if (rawData['ref:whc'] || rawData['heritage:operator'] === 'whc') {
          priority = 1; // UNESCO sites
        } else if (categories.includes('building.historic') || categories.includes('tourism.sights.memorial')) {
          priority = 2; // Historical monuments
        } else if (categories.includes('tourism.sights.castle') || categories.includes('tourism.sights.fort')) {
          priority = 3; // Forts
        } else if (categories.includes('religion.place_of_worship.hinduism') && (rawData.historic || categories.includes('building.historic'))) {
          priority = 4; // Ancient temples
        } else if (categories.includes('religion.place_of_worship.hinduism')) {
          priority = 5; // Famous temples
        } else if (categories.includes('leisure.park') || categories.includes('commercial.marketplace')) {
          priority = 6; // Famous and big parks and markets
        } else if (categories.includes('entertainment.museum')) {
          priority = 7; // Museums
        } else if (categories.includes('commercial.shopping_mall')) {
          priority = 8; // Malls
        }

        // Limit museums to 1-2
        if (categories.includes('entertainment.museum')) {
          if (museumCount >= 2) continue; // Skip if already have 2 museums
          museumCount++;
        }

        // Limit parks to max 3
        if (categories.includes('leisure.park')) {
          if (parkCount >= 3) continue; // Skip if already have 3 parks
          parkCount++;
        }

        // Fetch details including opening hours and images
        let openingHours = 'Not available';
        let imageUrl = null;
        if (placeId) {
          try {
            const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${GEOAPIFY_API_KEY}`;
            const detailsResponse = await axios.get(detailsUrl);
            const datasource = detailsResponse.data.features[0]?.properties?.datasource;
            if (datasource && datasource.raw && datasource.raw.opening_hours) {
              openingHours = datasource.raw.opening_hours;
            }
            // Extract image URL if available
            if (datasource && datasource.raw && datasource.raw.image) {
              imageUrl = datasource.raw.image;
            }
          } catch (detailsError) {
            console.warn(`Failed to fetch details for ${name}:`, detailsError.message);
          }
        }

        places.push({
          name,
          lat,
          lng,
          category: categories[0] || 'tourism',
          address: feature.properties.formatted || feature.properties.address_line1 || 'Address not available',
          openingHours,
          imageUrl,
          info: `${name} (${categories[0] || 'tourism'})`,
          priority
        });
      }

      // Sort places by priority (ascending), then by name
      places.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.name.localeCompare(b.name);
      });

      return places;
    }

    return []; // No places found

  } catch (error) {
    console.error('Geoapify Places Error:', error.message || error);
    throw new Error(`Failed to fetch places for ${city}`);
  }
};

/**
 * Calculates the distance between two points using Haversine formula.
 * @param {number} lat1 Latitude of first point.
 * @param {number} lng1 Longitude of first point.
 * @param {number} lat2 Latitude of second point.
 * @param {number} lng2 Longitude of second point.
 * @returns {number} Distance in kilometers.
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


/**
 * Fetch road route between multiple waypoints using Geoapify Routing API.
 * @param {Array} waypoints array of {lat, lng}
 * @returns {Array} polyline coordinates
 */
export const getRoadRoute = async (waypoints) => {
  const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;

  const waypointStr = waypoints.map(w => `${w.lat},${w.lng}`).join("|");

  const url = `https://api.geoapify.com/v1/routing?waypoints=${waypointStr}&mode=drive&details=route&apiKey=${GEOAPIFY_API_KEY}`;

  const response = await axios.get(url);
  const coords = response.data.features[0].geometry.coordinates[0]
    .map(([lng, lat]) => ({ lat, lng }));

  return coords;
};

/**
 * Fetches nearby places using Geoapify Places API based on categories.
 * @param {number} lat Latitude of the center point.
 * @param {number} lng Longitude of the center point.
 * @param {Array<string>} categories Array of category strings (e.g., ['accommodation.hotel', 'catering.restaurant']).
 * @param {number} radius Radius in meters (default 5000).
 * @param {number} limit Number of places to fetch (default 20).
 * @returns {Promise<Array>} Array of place objects with basic info.
 */
export const fetchNearbyPlaces = async (lat, lng, categories, radius = 5000, limit = 20) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  const categoriesStr = categories.join(',');
  const url = `https://api.geoapify.com/v2/places?categories=${categoriesStr}&filter=circle:${lng},${lat},${radius}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      return features.map(feature => ({
        place_id: feature.properties.place_id,
        name: feature.properties.name || 'Unnamed Place',
        address: feature.properties.formatted || feature.properties.address_line1 || 'Address not available',
        categories: feature.properties.categories || [],
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        distance: feature.properties.distance || null
      }));
    }

    return [];
  } catch (error) {
    console.error('Geoapify Nearby Places Error:', error.message || error);
    throw new Error(`Failed to fetch nearby places: ${error.message}`);
  }
};

/**
 * Fetches detailed information for a specific place using Geoapify Place Details API.
 * @param {string} placeId The place ID from the places search.
 * @returns {Promise<object>} Detailed place information including website, phone, photos, rating, etc.
 */
export const fetchPlaceDetails = async (placeId) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  const url = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const feature = response.data.features[0];

    if (feature) {
      const properties = feature.properties;
      const datasource = properties.datasource?.raw || {};

      return {
        place_id: properties.place_id,
        name: properties.name || 'Unnamed Place',
        address: properties.formatted || properties.address_line1 || 'Address not available',
        categories: properties.categories || [],
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        website: datasource.website || datasource.contact?.website || null,
        phone: datasource.phone || datasource.contact?.phone || null,
        email: datasource.email || datasource.contact?.email || null,
        opening_hours: datasource.opening_hours || null,
        rating: datasource.rating || null,
        photos: datasource.image ? [datasource.image] : [], // Geoapify may provide image URLs
        description: datasource.description || null,
        amenities: datasource.amenities || [],
        cuisine: datasource.cuisine || null,
        price_range: datasource.price_range || null
      };
    }

    throw new Error('Place details not found.');
  } catch (error) {
    console.error('Geoapify Place Details Error:', error.message || error);
    throw new Error(`Failed to fetch place details: ${error.message}`);
  }
};

/**
 * Fetches autocomplete suggestions for cities and places using Geoapify Autocomplete API.
 * @param {string} text The text to autocomplete.
 * @param {number} limit Number of suggestions to fetch (default 5).
 * @returns {Promise<Array>} Array of suggestion objects with { text, lat, lng, type }.
 */
export const fetchAutocompleteSuggestions = async (text, limit = 5) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  if (!text || text.trim().length < 2) {
    return [];
  }

  // Geoapify Autocomplete API endpoint, limiting to cities and places
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text.trim())}&limit=${limit}&type=city,place&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      return features.map(feature => ({
        text: feature.properties.formatted || feature.properties.address_line1 || 'Unknown',
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        type: feature.properties.result_type || 'place'
      }));
    }

    return [];
  } catch (error) {
    console.error('Geoapify Autocomplete Error:', error.message || error);
    throw new Error(`Failed to fetch autocomplete suggestions: ${error.message}`);
  }
};
