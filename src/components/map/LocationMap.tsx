
import React, { useEffect, useState, useRef } from 'react';
import { Map, Source, Layer, Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode } from '@/utils/locationUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Mapbox access token - in a real app, this should be in an environment variable
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// Circle layer for approximate location
const circleLayer = {
  id: 'circle-layer',
  type: 'circle',
  paint: {
    'circle-radius': 70,
    'circle-color': '#ff385c',
    'circle-opacity': 0.2,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ff385c'
  }
};

const markerStyle = {
  cursor: 'pointer',
  fill: '#ff385c'
};

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  height?: string;
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showMarker?: boolean;
  approximate?: boolean;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  height = '300px',
  zoom = 13,
  interactive = true,
  onLocationSelect,
  showMarker = true,
  approximate = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(Date.now()); // For map reloading
  const mapRef = useRef<any>(null);

  // Default center if no coordinates provided - Dubai as an example location
  const center = {
    longitude: longitude !== undefined ? longitude : 55.2708,
    latitude: latitude !== undefined ? latitude : 25.2048
  };

  const handleMapLoad = () => {
    console.log("Map loaded successfully");
    setLoading(false);
  };

  const handleMapError = (error: any) => {
    console.error("Map loading error:", error);
    setMapError("Failed to load map. Please check your connection and try again.");
    setLoading(false);
  };

  const handleReloadMap = () => {
    setLoading(true);
    setMapError(null);
    setMapKey(Date.now()); // Force re-render of map
  };

  const handleMapClick = async (event: any) => {
    if (!interactive || !onLocationSelect) return;
    
    const { lngLat } = event;
    const lng = lngLat.lng;
    const lat = lngLat.lat;
    
    console.log("Map clicked at:", lat, lng);
    
    try {
      // Get address from coordinates
      const address = await reverseGeocode(lat, lng);
      console.log("Reverse geocoded address:", address);
      onLocationSelect(lat, lng, address);
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      onLocationSelect(lat, lng, "Unknown location");
    }
  };

  const geojsonData = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [longitude || 0, latitude || 0]
    },
    properties: {}
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {loading && <Skeleton className="absolute inset-0 z-10" />}
      
      {mapError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100 rounded-md">
          <p className="text-red-500 mb-4">{mapError}</p>
          <Button onClick={handleReloadMap} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Map
          </Button>
        </div>
      )}
      
      <div className="w-full h-full rounded-md overflow-hidden" key={mapKey}>
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          initialViewState={{
            longitude: center.longitude,
            latitude: center.latitude,
            zoom: latitude !== undefined && longitude !== undefined ? zoom : 6
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          onError={handleMapError}
          interactive={interactive}
          attributionControl={true}
        >
          {/* Navigation controls (zoom, etc.) */}
          {interactive && <NavigationControl position="bottom-left" />}
          
          {/* Geolocation control */}
          {interactive && <GeolocateControl position="bottom-right" />}
          
          {/* Show marker or circle */}
          {showMarker && latitude !== undefined && longitude !== undefined && (
            approximate ? (
              <Source id="circle-source" type="geojson" data={geojsonData}>
                <Layer {...circleLayer} />
              </Source>
            ) : (
              <Marker
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
                style={markerStyle}
              />
            )
          )}
        </Map>
      </div>
      
      {interactive && (
        <div className="absolute bottom-2 right-2 z-10">
          <Button onClick={handleReloadMap} variant="outline" size="sm" className="bg-white">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Map
          </Button>
        </div>
      )}
    </div>
  );
};
