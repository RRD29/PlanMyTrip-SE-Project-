import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon not showing up in React
// The property name is '_getIconUrl' with a leading underscore and no spaces.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the tile URL using the environment variable
const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;


const GeoapifyMapWrapper = ({ center, zoom = 13, markers = [] }) => {
  // Center prop for Leaflet must be an array: [latitude, longitude]
  const defaultCenter = [0, 0]; 
  const mapCenter = center && center.length === 2 ? center : defaultCenter;

  // Memoize the map to prevent unnecessary re-renders, improving performance
  const displayMap = useMemo(
    () => (
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={false} // Prevents unwanted zoom with scroll
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Powered by <a href="https://www.geoapify.com/">Geoapify</a>'
          url={TILE_URL}
        />
        
        {/* Render Markers for each location */}
        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            position={[marker.lat, marker.lng]} // Marker position: [latitude, longitude]
          >
            {marker.info && <Popup>{marker.info}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    ),
    [mapCenter, zoom, markers]
  );

  return (
      <div className="map-container">
          {displayMap}
      </div>
  );
};

export default GeoapifyMapWrapper;