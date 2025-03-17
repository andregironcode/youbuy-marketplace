
/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Using a valid Mapbox public token
const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2w1Ym0wbHZwMDh2aTNlcGR6YWU3Z3JpbiJ9.qQS0pzU_WF9nbKJR-phJJA";

/**
 * Get the current position of the user
 * @returns Promise that resolves to the user's coordinates or rejects with an error
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      console.log("Requesting geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation success:", position.coords.latitude, position.coords.longitude);
          resolve(position);
        }, 
        (error) => {
          console.error("Geolocation error:", error.code, error.message);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    }
  });
};

/**
 * Geocode an address to get coordinates
 * @param address Address to geocode
 * @returns Promise that resolves to coordinates or rejects with an error
 */
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number}> => {
  console.log("Geocoding address:", address);
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}`;
    console.log("Geocoding URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API error:', response.status, errorText);
      throw new Error(`Geocoding failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Geocoding success response:", data);
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      console.log("Geocoded coordinates:", lat, lng);
      return { lat, lng };
    } else {
      console.error("No geocoding results found");
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to get address
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise that resolves to address or rejects with an error
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  console.log("Reverse geocoding:", lat, lng);
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
    console.log("Reverse geocoding URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reverse geocoding API error:', response.status, errorText);
      throw new Error(`Reverse geocoding failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Reverse geocoding success response:", data);
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    } else {
      console.error("No reverse geocoding results found");
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Get a fuzzy location for display (approx location with 500m radius)
 * @param lat Precise latitude
 * @param lng Precise longitude
 * @returns Promise that resolves to a neighborhood or area name
 */
export const getFuzzyLocation = async (lat: number, lng: number): Promise<string> => {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=neighborhood,locality,place&access_token=${MAPBOX_TOKEN}`;
    console.log("Fuzzy location URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Fuzzy location lookup failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Return the neighborhood or locality name
      return data.features[0].text;
    } else {
      // Fallback to regular reverse geocoding
      return await reverseGeocode(lat, lng);
    }
  } catch (error) {
    console.error('Fuzzy location error:', error);
    // Fallback to generic area description
    return "Nearby location";
  }
};
