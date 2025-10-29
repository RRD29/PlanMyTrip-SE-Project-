import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

// Define the map's dimensions
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

/**
 * A "dumb" wrapper for the Google Map component.
 * It assumes the Google Maps script is ALREADY LOADED by a parent.
 * @param {object} props
 * @param {object} props.center - The center of the map.
 * @param {number} [props.zoom=10] - The initial zoom level
 * @param {React.Node} [props.children] - Markers, Polylines, etc.
 */
const GoogleMapWrapper = ({ center, zoom = 10, children }) => {
  // No more useJsApiLoader, no more isLoaded/loadError checks.
  // We just render the map, assuming the script is ready.
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        // Disable default UI elements we don't need
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
      }}
    >
      {children}
    </GoogleMap>
  );
};

export default GoogleMapWrapper;