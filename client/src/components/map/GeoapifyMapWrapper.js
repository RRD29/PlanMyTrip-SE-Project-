import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;


const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2 && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const GeoapifyMapWrapper = ({ center, zoom = 13, markers = [], route = [] }) => {
  const defaultCenter = [39.8283, -98.5795]; 
  const mapCenter = center && center.length === 2 ? center : defaultCenter;

  const displayMap = useMemo(
    () => (
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '500px', width: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors | Geoapify'
          url={TILE_URL}
        />

        {}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.info && <Popup>{marker.info}</Popup>}
          </Marker>
        ))}

        {}
        {route.length > 0 && (
          <Polyline
            positions={route.map(coord => [coord.lat, coord.lng])}
            weight={5}
            opacity={0.8}
            color="blue"
          />
        )}
      </MapContainer>
    ),
    [mapCenter, zoom, markers, center, route]
  );

  return <div className="map-container">{displayMap}</div>;
};

export default GeoapifyMapWrapper;
