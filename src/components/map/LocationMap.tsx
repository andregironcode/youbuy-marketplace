
import React, { useEffect, useState, useRef } from 'react';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode } from '@/utils/locationUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, ZoomIn, ZoomOut, Navigation } from 'lucide-react';

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
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const mapRef = useRef<any>(null);

  // Default center if no coordinates provided - Dubai as an example location
  const center = {
    longitude: longitude !== undefined ? longitude : 55.2708,
    latitude: latitude !== undefined ? latitude : 25.2048
  };

  const handleMapLoad = () => {
    console.log("Map loaded successfully");
    setLoading(false);
    
    // Initialize map reference
    if (mapRef.current && mapRef.current.getMap) {
      const map = mapRef.current.getMap();
      
      // Add navigation controls (zoom, compass)
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      
      // Add geolocate control
      if (interactive) {
        map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          }),
          'bottom-left'
        );
      }
    }
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

  const handleZoomIn = () => {
    if (mapRef.current && mapRef.current.getMap) {
      const map = mapRef.current.getMap();
      const newZoom = Math.min((map.getZoom() || currentZoom) + 1, 20);
      map.zoomTo(newZoom);
      setCurrentZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && mapRef.current.getMap) {
      const map = mapRef.current.getMap();
      const newZoom = Math.max((map.getZoom() || currentZoom) - 1, 1);
      map.zoomTo(newZoom);
      setCurrentZoom(newZoom);
    }
  };

  // Create a marker element for showing the location
  const renderMarker = () => {
    if (!showMarker || latitude === undefined || longitude === undefined) return null;
    
    if (approximate) {
      // For approximate location, use a circle on the map
      return (
        <div className="rounded-full w-14 h-14 bg-red-400/20 border-2 border-red-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      );
    } else {
      // For exact location, use a marker
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="w-2 h-2 bg-red-500 rotate-45 transform origin-top absolute left-1/2 -ml-1"></div>
        </div>
      );
    }
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
        <div className="relative w-full h-full">
          <div 
            ref={mapRef} 
            id="map"
            className="w-full h-full" 
          />
          {renderMarker()}
        </div>
      </div>
      
      {interactive && (
        <>
          {/* Custom zoom controls */}
          <div className="absolute bottom-16 right-2 z-10 flex flex-col space-y-2">
            <Button onClick={handleZoomIn} variant="outline" size="icon" className="bg-white h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button onClick={handleZoomOut} variant="outline" size="icon" className="bg-white h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Reload button */}
          <div className="absolute bottom-2 right-2 z-10">
            <Button onClick={handleReloadMap} variant="outline" size="sm" className="bg-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Map
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Initialize once the component has mounted
useEffect(() => {
  if (typeof window !== 'undefined') {
    import('mapbox-gl').then(mapboxgl => {
      // Set access token
      mapboxgl.default.accessToken = MAPBOX_ACCESS_TOKEN;
      
      // Create map instance
      if (mapRef.current && !mapRef.current.getMap) {
        const map = new mapboxgl.default.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [center.longitude, center.latitude],
          zoom: latitude !== undefined && longitude !== undefined ? zoom : 6,
          interactive: interactive
        });
        
        // Store map instance on the ref
        mapRef.current.getMap = () => map;
        
        // Set up event handlers
        map.on('load', handleMapLoad);
        map.on('error', handleMapError);
        
        if (interactive && onLocationSelect) {
          map.on('click', handleMapClick);
        }
        
        // Clean up
        return () => {
          map.remove();
        };
      }
    }).catch(error => {
      console.error("Error loading mapbox-gl:", error);
      setMapError("Failed to load map library. Please check your connection and try again.");
      setLoading(false);
    });
  }
}, [mapKey, center.longitude, center.latitude, zoom, interactive, latitude, longitude, onLocationSelect]);
