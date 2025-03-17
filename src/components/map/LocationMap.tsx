
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode } from '@/utils/locationUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mapbox access token - in a real app, this should be in an environment variable
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYW5kcmVnaXJvbiIsImEiOiJjbThkamljNjQyNjFqMmxzNWt1NzdyZ3d4In0.8UA0NxYTGPiSsdcSV_5szA';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const mapInitialized = useRef(false);
  const markersInitialized = useRef(false);

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

  const handleMapClick = async (event: mapboxgl.MapMouseEvent) => {
    if (!interactive || !onLocationSelect || !mapInstance.current) return;
    
    const { lngLat } = event;
    const lng = lngLat.lng;
    const lat = lngLat.lat;
    
    console.log("Map clicked at:", lat, lng);
    
    try {
      // Get address from coordinates
      const address = await reverseGeocode(lat, lng);
      console.log("Reverse geocoded address:", address);
      onLocationSelect(lat, lng, address);
      
      // Update marker position
      updateMarkerPosition(lng, lat);
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      onLocationSelect(lat, lng, "Unknown location");
    }
  };

  // Function to update marker position
  const updateMarkerPosition = (lng: number, lat: number) => {
    if (!mapInstance.current) return;

    if (approximate) {
      // Update approximate circle
      if (mapInstance.current.getSource('approximate-location')) {
        (mapInstance.current.getSource('approximate-location') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {}
        });
      }
    } else {
      // Update exact marker
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        // Create marker if it doesn't exist
        markerRef.current = new mapboxgl.Marker({ color: '#ff385c' })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);
      }
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInitialized.current) return;
    
    try {
      console.log("Initializing map with token:", MAPBOX_ACCESS_TOKEN);
      
      // Set access token
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      
      // Create map instance
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.longitude, center.latitude],
        zoom: latitude !== undefined && longitude !== undefined ? zoom : 6,
        interactive: interactive,
        attributionControl: true
      });
      
      // Store map instance
      mapInstance.current = map;
      mapInitialized.current = true;
      
      // Set up event handlers
      map.on('load', handleMapLoad);
      map.on('error', handleMapError);
      
      if (interactive && onLocationSelect) {
        map.on('click', handleMapClick);
      }
      
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
      
      // Add map load listener for adding sources/layers
      map.on('load', () => {
        // Only initialize markers if we have coordinates and showMarker is true
        if (showMarker && latitude !== undefined && longitude !== undefined && !markersInitialized.current) {
          if (approximate) {
            // For approximate location, add a circle
            if (!map.getSource('approximate-location')) {
              map.addSource('approximate-location', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                  },
                  properties: {}
                }
              });
              
              map.addLayer({
                id: 'approximate-location-circle',
                type: 'circle',
                source: 'approximate-location',
                paint: {
                  'circle-radius': 70,
                  'circle-color': '#ff385c',
                  'circle-opacity': 0.2,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ff385c'
                }
              });
            }
          } else {
            // For exact location, use a marker
            if (!markerRef.current) {
              markerRef.current = new mapboxgl.Marker({ color: '#ff385c' })
                .setLngLat([longitude, latitude])
                .addTo(map);
            }
          }
          markersInitialized.current = true;
        }
      });
      
      console.log("Map initialization completed");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please check your connection and try again.");
      setLoading(false);
    }
    
    // Clean up function
    return () => {
      console.log("Cleaning up map");
      if (mapInstance.current) {
        if (interactive && onLocationSelect) {
          mapInstance.current.off('click', handleMapClick);
        }
        mapInstance.current.off('load', handleMapLoad);
        mapInstance.current.off('error', handleMapError);
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      mapInitialized.current = false;
      markersInitialized.current = false;
    };
  }, []); // Only run once on component mount
  
  // Update map when coordinates change
  useEffect(() => {
    if (!mapInstance.current || !mapInitialized.current) return;
    
    // Update map center if coordinates changed
    if (latitude !== undefined && longitude !== undefined) {
      mapInstance.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        essential: true
      });
      
      // Update marker position
      updateMarkerPosition(longitude, latitude);
    }
  }, [latitude, longitude, zoom, approximate, showMarker]);

  // Create a marker element for showing the location
  const renderMarker = () => {
    if (!showMarker || latitude === undefined || longitude === undefined) return null;
    
    // Only render custom markers if the map isn't loaded yet
    if (!loading) return null;
    
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
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Try refreshing the page to reload the map.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="w-full h-full rounded-md overflow-hidden">
        <div className="relative w-full h-full">
          <div 
            ref={mapRef} 
            className="w-full h-full" 
          />
          {renderMarker()}
        </div>
      </div>
    </div>
  );
};
