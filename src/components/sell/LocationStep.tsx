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
import { ArrowRight, MapPin, AlertCircle, Info, Home, Building } from "lucide-react";
import { SellStep } from "@/types/sellForm";
import { LocationMap } from "@/components/map/LocationMap";
import { geocodeAddress, getCurrentPosition, reverseGeocode } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LocationStepProps {
  location: string;
  setLocation: (location: string) => void;
  coordinates: { latitude?: number; longitude?: number } | null;
  setCoordinates: (coords: { latitude: number; longitude: number } | null) => void;
  setCurrentStep: (step: SellStep) => void;
  locationDetails?: LocationDetails;
  setLocationDetails?: (details: LocationDetails) => void;
}

type LocationType = "house" | "apartment";

interface LocationDetails {
  type: LocationType;
  houseNumber?: string;
  buildingName?: string;
  apartmentNumber?: string;
  floor?: string;
  additionalInfo?: string;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  location,
  setLocation,
  coordinates,
  setCoordinates,
  setCurrentStep,
  locationDetails: initialLocationDetails,
  setLocationDetails: setLocationDetailsProp,
}) => {
  const [searchValue, setSearchValue] = useState(location);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(true);
  const { toast } = useToast();
  
  const [locationDetails, setLocationDetails] = useState<LocationDetails>(initialLocationDetails || {
    type: "house",
    houseNumber: "",
    buildingName: "",
    apartmentNumber: "",
    floor: "",
    additionalInfo: ""
  });

  // Update parent component when location details change
  useEffect(() => {
    if (setLocationDetailsProp) {
      setLocationDetailsProp(locationDetails);
    }
  }, [locationDetails, setLocationDetailsProp]);

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
        errorMessage = "Location access was denied. Please check your browser permissions and ensure location is enabled.";
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

  // Handle location type change
  const handleLocationTypeChange = (value: string) => {
    setLocationDetails({
      ...locationDetails,
      type: value as LocationType
    });
  };

  // Handle location details change
  const handleLocationDetailsChange = (field: keyof LocationDetails, value: string) => {
    setLocationDetails({
      ...locationDetails,
      [field]: value
    });
  };

  // Format full address with location details
  const formatFullAddress = () => {
    let formattedDetails = "";
    
    if (locationDetails.type === "house") {
      if (locationDetails.houseNumber) {
        formattedDetails += `House #${locationDetails.houseNumber}`;
      }
      if (locationDetails.additionalInfo) {
        formattedDetails += formattedDetails ? `, ${locationDetails.additionalInfo}` : locationDetails.additionalInfo;
      }
    } else {
      if (locationDetails.buildingName) {
        formattedDetails += locationDetails.buildingName;
      }
      if (locationDetails.floor) {
        formattedDetails += formattedDetails ? `, Floor ${locationDetails.floor}` : `Floor ${locationDetails.floor}`;
      }
      if (locationDetails.apartmentNumber) {
        formattedDetails += formattedDetails ? `, Apt #${locationDetails.apartmentNumber}` : `Apt #${locationDetails.apartmentNumber}`;
      }
      if (locationDetails.additionalInfo) {
        formattedDetails += formattedDetails ? `, ${locationDetails.additionalInfo}` : locationDetails.additionalInfo;
      }
    }
    
    if (formattedDetails && location) {
      return `${formattedDetails}, ${location}`;
    }
    
    return location;
  };

  // Update location with details when continuing
  const handleContinue = () => {
    const fullAddress = formatFullAddress();
    setLocation(fullAddress);
    setCurrentStep("preview");
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
          
          {isLocationValid && (
            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="font-medium">Location Details</h3>
              
              <RadioGroup 
                value={locationDetails.type} 
                onValueChange={handleLocationTypeChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="house" id="house" />
                  <Label htmlFor="house" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    House
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apartment" id="apartment" />
                  <Label htmlFor="apartment" className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Apartment
                  </Label>
                </div>
              </RadioGroup>
              
              {locationDetails.type === "house" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="houseNumber">House Number</Label>
                    <Input
                      id="houseNumber"
                      placeholder="e.g., 123"
                      value={locationDetails.houseNumber || ""}
                      onChange={(e) => handleLocationDetailsChange("houseNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                    <Input
                      id="additionalInfo"
                      placeholder="e.g., Gate code, landmark"
                      value={locationDetails.additionalInfo || ""}
                      onChange={(e) => handleLocationDetailsChange("additionalInfo", e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="buildingName">Building Name</Label>
                    <Input
                      id="buildingName"
                      placeholder="e.g., Sunset Towers"
                      value={locationDetails.buildingName || ""}
                      onChange={(e) => handleLocationDetailsChange("buildingName", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        placeholder="e.g., 5"
                        value={locationDetails.floor || ""}
                        onChange={(e) => handleLocationDetailsChange("floor", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apartmentNumber">Apartment Number</Label>
                      <Input
                        id="apartmentNumber"
                        placeholder="e.g., 502"
                        value={locationDetails.apartmentNumber || ""}
                        onChange={(e) => handleLocationDetailsChange("apartmentNumber", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                    <Input
                      id="additionalInfo"
                      placeholder="e.g., Buzzer code, landmark"
                      value={locationDetails.additionalInfo || ""}
                      onChange={(e) => handleLocationDetailsChange("additionalInfo", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="rounded-md overflow-hidden border">
            {mapVisible && (
              <LocationMap 
                latitude={coordinates?.latitude}
                longitude={coordinates?.longitude}
                height="300px"
                zoom={coordinates?.latitude && coordinates?.longitude ? 14 : 6}
                onLocationSelect={handleLocationSelect}
                showMarker={!!(coordinates?.latitude && coordinates?.longitude)}
              />
            )}
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              This is the spot where your profile is located. We will show all your products here.
              For privacy, buyers will only see an approximate area.
            </AlertDescription>
          </Alert>
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
          onClick={handleContinue}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
