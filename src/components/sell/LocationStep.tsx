
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
import { ArrowRight, MapPin } from "lucide-react";
import { SellStep } from "@/types/sellForm";
import { LocationMap } from "@/components/map/LocationMap";
import { geocodeAddress, getCurrentPosition } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";

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
  const [mapInitialized, setMapInitialized] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { toast } = useToast();

  const isLocationValid = location.length >= 3 && coordinates !== null;

  useEffect(() => {
    // If we have coordinates but no initialized map, set the flag
    if (coordinates && !mapInitialized) {
      setMapInitialized(true);
    }
  }, [coordinates, mapInitialized]);

  // Get user's current location
  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Set coordinates
      setCoordinates({ latitude, longitude });
      
      // Reverse geocode to get address
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoibG92YWJsZS1tYXAiLCJhIjoiY2x2enlxcGJjMDEybDJqb3Q2NDlmY3ZicyJ9.LZ0u_KqmmsdWlnFE_GzV7A`
      );
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const addressValue = data.features[0].place_name;
        setSearchValue(addressValue);
        setLocation(addressValue);
      }
      
      toast({
        title: "Location set",
        description: "Your current location has been set."
      });
    } catch (error) {
      console.error("Error getting current location:", error);
      toast({
        title: "Location error",
        description: "Unable to get your current location. Please enter it manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  // Search for location
  const handleSearch = async () => {
    if (searchValue.length < 3) return;
    
    setLoadingLocation(true);
    try {
      const coords = await geocodeAddress(searchValue);
      setCoordinates({ latitude: coords.lat, longitude: coords.lng });
      setLocation(searchValue);
    } catch (error) {
      console.error("Error geocoding address:", error);
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
    setCoordinates({ latitude: lat, longitude: lng });
    setSearchValue(address);
    setLocation(address);
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
            {searchValue.length > 0 && !isLocationValid && (
              <p className="text-xs text-red-500">Please enter a valid location and select a point on the map</p>
            )}
          </div>
          
          <div className="rounded-md overflow-hidden">
            <LocationMap 
              latitude={coordinates?.latitude}
              longitude={coordinates?.longitude}
              height="300px"
              zoom={coordinates ? 14 : 2}
              onLocationSelect={handleLocationSelect}
              showMarker={!!coordinates}
              className={!coordinates ? "bg-muted" : ""}
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
