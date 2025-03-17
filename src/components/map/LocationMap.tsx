
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode } from '@/utils/locationUtils';
import { Skeleton } from '@/components/ui/skeleton';

// Set Mapbox token to a valid public token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      setLoading(true);
      
      // Default center if no coordinates provided
      const initialCenter: [number, number] = [longitude || 0, latitude || 0];
      
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: latitude && longitude ? zoom : 2,
          interactive: interactive,
        });

        // Add navigation controls if interactive
        if (interactive) {
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Wait for map to load
        map.current.on('load', () => {
          setLoading(false);
          setMapInitialized(true);
          
          if (latitude && longitude) {
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

        // Set up click handler if interactive and onLocationSelect provided
        if (interactive && onLocationSelect) {
          map.current.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            
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
              onLocationSelect(lat, lng, address);
            } catch (error) {
              console.error('Error in reverse geocoding:', error);
              onLocationSelect(lat, lng, "Unknown location");
            }
          });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
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
      <div ref={mapContainer} className="w-full h-full rounded-md overflow-hidden" />
    </div>
  );
};
