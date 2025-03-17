
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode } from '@/utils/locationUtils';
import { Skeleton } from '@/components/ui/skeleton';

// Set Mapbox token to the updated valid public token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2w1Ym0wbHZwMDh2aTNlcGR6YWU3Z3JpbiJ9.qQS0pzU_WF9nbKJR-phJJA';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      setLoading(true);
      setMapError(null);
      
      console.log("Initializing map with coordinates:", latitude, longitude);
      
      // Default center if no coordinates provided - pointing to Dubai as an example location
      const initialCenter: [number, number] = longitude !== undefined && latitude !== undefined 
        ? [longitude, latitude] 
        : [55.2708, 25.2048]; // Dubai coordinates as default
      
      try {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        
        console.log("Creating new map with center:", initialCenter);
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: latitude !== undefined && longitude !== undefined ? zoom : 6,
          interactive: interactive,
        });

        // Add navigation controls if interactive
        if (interactive) {
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Wait for map to load
        map.current.on('load', () => {
          console.log("Map loaded successfully");
          setLoading(false);
          setMapInitialized(true);
          
          if (latitude !== undefined && longitude !== undefined) {
            console.log("Setting map center to:", longitude, latitude);
            // Center map on provided coordinates
            map.current?.setCenter([longitude, latitude]);
            map.current?.setZoom(zoom);
            
            // Add marker if coordinates are provided
            if (showMarker) {
              if (!approximate) {
                // Regular marker for exact location
                if (marker.current) {
                  marker.current.setLngLat([longitude, latitude]);
                } else {
                  marker.current = new mapboxgl.Marker({ color: '#ff385c' })
                    .setLngLat([longitude, latitude])
                    .addTo(map.current!);
                }
              } else {
                // Add a circle for approximate location
                if (map.current?.getSource('radius-source')) {
                  (map.current.getSource('radius-source') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [longitude, latitude],
                    },
                    properties: {},
                  });
                } else {
                  map.current?.addSource('radius-source', {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                      },
                      properties: {},
                    },
                  });

                  map.current?.addLayer({
                    id: 'radius-circle',
                    type: 'circle',
                    source: 'radius-source',
                    paint: {
                      'circle-radius': 100, // Size of the circle in pixels
                      'circle-color': '#ff385c',
                      'circle-opacity': 0.3,
                      'circle-stroke-width': 2,
                      'circle-stroke-color': '#ff385c',
                    },
                  });
                }
              }
            }
          }
        });

        // Error handling for map
        map.current.on('error', (e) => {
          console.error("Map error:", e);
          setMapError("Failed to load map. Please try again.");
          setLoading(false);
        });

        // Set up click handler if interactive and onLocationSelect provided
        if (interactive && onLocationSelect) {
          map.current.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            console.log("Map clicked at:", lat, lng);
            
            // Update marker position
            if (marker.current) {
              marker.current.setLngLat([lng, lat]);
            } else {
              marker.current = new mapboxgl.Marker({ color: '#ff385c' })
                .setLngLat([lng, lat])
                .addTo(map.current!);
            }
            
            try {
              // Get address from coordinates
              const address = await reverseGeocode(lat, lng);
              console.log("Reverse geocoded address:", address);
              onLocationSelect(lat, lng, address);
            } catch (error) {
              console.error('Error in reverse geocoding:', error);
              onLocationSelect(lat, lng, "Unknown location");
            }
          });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map. Please try again.");
        setLoading(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom, interactive, onLocationSelect, showMarker, approximate]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {loading && <Skeleton className="absolute inset-0 z-10" />}
      {mapError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100 rounded-md">
          <p className="text-red-500">{mapError}</p>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full rounded-md overflow-hidden" />
    </div>
  );
};
