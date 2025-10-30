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
