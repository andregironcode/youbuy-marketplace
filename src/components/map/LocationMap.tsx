
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '@/utils/locationUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center and zoom when props change
const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

// Component to handle map clicks
const MapClickHandler = ({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void 
}) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
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

    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);
  
  return null;
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

  // Default center if no coordinates provided - Dubai as an example location
  const center: [number, number] = longitude !== undefined && latitude !== undefined 
    ? [latitude, longitude] 
    : [25.2048, 55.2708];

  const handleMapLoad = () => {
    console.log("Map loaded successfully");
    setLoading(false);
  };

  const handleMapError = (error: Error) => {
    console.error("Map error:", error);
    setMapError("Failed to load map. Please try again.");
    setLoading(false);
  };

  const handleReloadMap = () => {
    setLoading(true);
    setMapError(null);
    setMapKey(Date.now()); // Force re-render of map
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
        <MapContainer
          center={center}
          zoom={latitude !== undefined && longitude !== undefined ? zoom : 6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={interactive}
          dragging={interactive}
          touchZoom={interactive}
          doubleClickZoom={interactive}
          scrollWheelZoom={interactive}
          attributionControl={true}
          whenReady={handleMapLoad}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            onError={handleMapError}
          />
          
          <MapUpdater center={center} zoom={zoom} />
          
          {interactive && onLocationSelect && (
            <MapClickHandler onLocationSelect={onLocationSelect} />
          )}
          
          {showMarker && latitude !== undefined && longitude !== undefined && (
            approximate ? (
              <Circle 
                center={[latitude, longitude]} 
                radius={500} 
                pathOptions={{ 
                  fillColor: '#ff385c', 
                  fillOpacity: 0.2,
                  color: '#ff385c',
                  weight: 2
                }} 
              />
            ) : (
              <Marker position={[latitude, longitude]} />
            )
          )}
        </MapContainer>
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
