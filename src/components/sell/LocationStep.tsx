
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin, AlertCircle } from "lucide-react";
import { SellStep } from "@/types/sellForm";
import { LocationMap } from "@/components/map/LocationMap";
import { geocodeAddress, getCurrentPosition, reverseGeocode } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationStepProps {
  location: string;
  setLocation: (location: string) => void;
  coordinates: { latitude?: number; longitude?: number } | null;
  setCoordinates: (coords: { latitude: number; longitude: number } | null) => void;
  setCurrentStep: (step: SellStep) => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  location,
  setLocation,
  coordinates,
  setCoordinates,
  setCurrentStep,
}) => {
  const [searchValue, setSearchValue] = useState(location);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const isLocationValid = location.length >= 3 && coordinates !== null && 
    coordinates.latitude !== undefined && coordinates.longitude !== undefined;

  // If location already exists but no coordinates, try to geocode it
  useEffect(() => {
    const setCoordinatesFromLocation = async () => {
      if (location && location.length >= 3 && (!coordinates || !coordinates.latitude || !coordinates.longitude)) {
        try {
          console.log("Trying to geocode existing location:", location);
          setLoadingLocation(true);
          setLocationError(null);
          const coords = await geocodeAddress(location);
          console.log("Geocoded coordinates:", coords);
          setCoordinates({ latitude: coords.lat, longitude: coords.lng });
        } catch (error) {
          console.error("Error geocoding existing location:", error);
          setLocationError("Failed to find this location. Please try a different address or use the map.");
        } finally {
          setLoadingLocation(false);
        }
      }
    };

    setCoordinatesFromLocation();
  }, [location, coordinates, setCoordinates]);

  // Get user's current location
  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    setLocationError(null);
    try {
      console.log("Getting current position...");
      const position = await getCurrentPosition();
      console.log("Current position received:", position);
      const { latitude, longitude } = position.coords;
      
      // Set coordinates
      setCoordinates({ latitude, longitude });
      
      // Reverse geocode to get address
      console.log("Reverse geocoding coordinates:", latitude, longitude);
      const address = await reverseGeocode(latitude, longitude);
      console.log("Address from reverse geocoding:", address);
      setSearchValue(address);
      setLocation(address);
      
      toast({
        title: "Location set",
        description: "Your current location has been set."
      });
    } catch (error: any) {
      console.error("Error getting current location:", error);
      let errorMessage = "Unable to get your current location. Please enter it manually.";
      
      // Provide more specific error messages based on the error code
      if (error.code === 1) {
        errorMessage = "Location access was denied. Please check your browser permissions.";
      } else if (error.code === 2) {
        errorMessage = "Your location is currently unavailable. Please try again later or enter manually.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again or enter manually.";
      }
      
      setLocationError(errorMessage);
      
      toast({
        title: "Location error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  // Search for location
  const handleSearch = async () => {
    if (searchValue.length < 3) {
      setLocationError("Please enter at least 3 characters for the location search.");
      return;
    }
    
    setLoadingLocation(true);
    setLocationError(null);
    try {
      console.log("Geocoding address:", searchValue);
      const coords = await geocodeAddress(searchValue);
      console.log("Geocoding results:", coords);
      setCoordinates({ latitude: coords.lat, longitude: coords.lng });
      setLocation(searchValue);
      
      toast({
        title: "Location found",
        description: "Location has been set successfully."
      });
    } catch (error) {
      console.error("Error geocoding address:", error);
      setLocationError("Unable to locate this address. Please try a different one or use the map.");
      
      toast({
        title: "Address error",
        description: "Unable to locate this address. Please try a different one.",
        variant: "destructive",
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  // Handle map click
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    console.log("Location selected from map:", lat, lng, address);
    setCoordinates({ latitude: lat, longitude: lng });
    setSearchValue(address);
    setLocation(address);
    setLocationError(null);
    
    toast({
      title: "Location selected",
      description: "Location has been set from the map."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your products are in:</CardTitle>
        <CardDescription>
          This is where potential buyers will see your item located
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="location" 
                  placeholder="Enter address or area"
                  className={`pl-10 ${!isLocationValid && searchValue.length > 0 ? "border-red-500" : ""}`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSearch}
                disabled={loadingLocation || searchValue.length < 3}
              >
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetCurrentLocation}
                disabled={loadingLocation}
              >
                My Location
              </Button>
            </div>
            {searchValue.length > 0 && !isLocationValid && !locationError && (
              <p className="text-xs text-red-500">Please enter a valid location and select a point on the map</p>
            )}
            
            {locationError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="rounded-md overflow-hidden border">
            <LocationMap 
              latitude={coordinates?.latitude}
              longitude={coordinates?.longitude}
              height="300px"
              zoom={coordinates?.latitude && coordinates?.longitude ? 14 : 2}
              onLocationSelect={handleLocationSelect}
              showMarker={!!(coordinates?.latitude && coordinates?.longitude)}
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            This is the spot where your profile is located. We will show all your products here.
            For privacy, buyers will only see an approximate area.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("shipping")}
        >
          Back
        </Button>
        <Button 
          disabled={!isLocationValid} 
          onClick={() => setCurrentStep("preview")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
