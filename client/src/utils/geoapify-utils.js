

import axios from 'axios';


const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;


export const geocodeAddress = async (address) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      
      const feature = features[0];

      
      const [lng, lat] = feature.geometry.coordinates;

      return {
          lat,
          lng,
          fullAddress: feature.properties.formatted, 
          confidence: feature.properties.confidence
      };
    }

    
    throw new Error('Address not found or no valid features returned.');

  } catch (error) {
    console.error('Geoapify Geocoding Error:', error.message || error);
    
    throw new Error(`Failed to geocode address: ${address}`);
  }
};


export const fetchRailwayStation = async (city) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  
  const cityData = await geocodeAddress(city);
  const { lat, lng } = cityData;

  
  const url = `https://api.geoapify.com/v2/places?categories=building.transportation.train_station&filter=circle:${lng},${lat},20000&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features && features.length > 0) {
      
      const station = features[0];
      const [lng, lat] = station.geometry.coordinates;
      return {
        lat,
        lng,
        name: station.properties.name || 'Main Railway Station'
      };
    }

    
    return { lat: cityData.lat, lng: cityData.lng, name: 'City Center' };
  } catch (error) {
    console.error('Geoapify Railway Station Error:', error.message);
    
    return { lat: cityData.lat, lng: cityData.lng, name: 'City Center' };
  }
};


export const fetchFamousPlaces = async (city, limit = 10, radius = 10) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  
  const station = await fetchRailwayStation(city);
  const { lat, lng } = station;

  
  const radiusMeters = radius * 1000;

  
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

        
        let priority = 10; 
        if (rawData['ref:whc'] || rawData['heritage:operator'] === 'whc') {
          priority = 1; 
        } else if (categories.includes('building.historic') || categories.includes('tourism.sights.memorial')) {
          priority = 2; 
        } else if (categories.includes('tourism.sights.castle') || categories.includes('tourism.sights.fort')) {
          priority = 3; 
        } else if (categories.includes('religion.place_of_worship.hinduism') && (rawData.historic || categories.includes('building.historic'))) {
          priority = 4; 
        } else if (categories.includes('religion.place_of_worship.hinduism')) {
          priority = 5; 
        } else if (categories.includes('leisure.park') || categories.includes('commercial.marketplace')) {
          priority = 6; 
        } else if (categories.includes('entertainment.museum')) {
          priority = 7; 
        } else if (categories.includes('commercial.shopping_mall')) {
          priority = 8; 
        }

        
        if (categories.includes('entertainment.museum')) {
          if (museumCount >= 2) continue; 
          museumCount++;
        }

        
        if (categories.includes('leisure.park')) {
          if (parkCount >= 3) continue; 
          parkCount++;
        }

        
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

      
      places.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.name.localeCompare(b.name);
      });

      return places;
    }

    return []; 

  } catch (error) {
    console.error('Geoapify Places Error:', error.message || error);
    throw new Error(`Failed to fetch places for ${city}`);
  }
};


export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



export const getRoadRoute = async (waypoints) => {
  const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;

  const waypointStr = waypoints.map(w => `${w.lat},${w.lng}`).join("|");

  const url = `https://api.geoapify.com/v1/routing?waypoints=${waypointStr}&mode=drive&details=route&apiKey=${GEOAPIFY_API_KEY}`;

  const response = await axios.get(url);
  const coords = response.data.features[0].geometry.coordinates[0]
    .map(([lng, lat]) => ({ lat, lng }));

  return coords;
};


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
        photos: datasource.image ? [datasource.image] : [], 
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


export const fetchAutocompleteSuggestions = async (text, limit = 5) => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key is missing. Check your .env file.");
  }

  if (!text || text.trim().length < 2) {
    return [];
  }

  
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
