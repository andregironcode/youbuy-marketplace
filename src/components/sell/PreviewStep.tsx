import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SellStep } from "@/types/sellForm";
import { ProductSpecifications } from "@/types/product";
import { LocationMap } from "@/components/map/LocationMap";
import { MapPin, Home, Building, Package, Info } from "lucide-react";

interface PreviewStepProps {
  title: string;
  price: string;
  description: string;
  location: string;
  imagePreviewUrls: string[];
  specifications: ProductSpecifications;
  weight: string;
  coordinates: { latitude: number; longitude: number } | null;
  locationDetails?: {
    type: "house" | "apartment";
    houseNumber?: string;
    buildingName?: string;
    apartmentNumber?: string;
    floor?: string;
    additionalInfo?: string;
  };
  shippingOptions: {
    inPersonMeetup: boolean;
    platformShipping: boolean;
    shippingCost: number;
  };
  setCurrentStep: (step: SellStep) => void;
  handleSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  title,
  price,
  description,
  location,
  imagePreviewUrls,
  specifications,
  weight,
  coordinates,
  locationDetails,
  shippingOptions,
  setCurrentStep,
  handleSubmit,
  uploading,
}) => {
  // Format location details for display
  const formatLocationDetails = () => {
    if (!locationDetails) return location || "Unknown location";
    
    const parts = [];
    
    // First, add the specific location details
    if (locationDetails.type === "house") {
      if (locationDetails.houseNumber) {
        parts.push(`House #${locationDetails.houseNumber}`);
      }
      if (locationDetails.additionalInfo) {
        parts.push(locationDetails.additionalInfo);
      }
    } else {
      if (locationDetails.buildingName) {
        parts.push(locationDetails.buildingName);
      }
      if (locationDetails.floor) {
        parts.push(`Floor ${locationDetails.floor}`);
      }
      if (locationDetails.apartmentNumber) {
        parts.push(`Apt #${locationDetails.apartmentNumber}`);
      }
      if (locationDetails.additionalInfo) {
        parts.push(locationDetails.additionalInfo);
      }
    }
    
    // Add the location address, but only if it's not already included in the parts
    if (location) {
      // Check if any part of the location is already in our parts
      const locationParts = location.split(", ");
      const isLocationIncluded = locationParts.some(part => 
        parts.some(existingPart => existingPart.includes(part))
      );
      
      if (!isLocationIncluded) {
        parts.push(location);
      }
    }
    
    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Your Listing</CardTitle>
        <CardDescription>
          Review your item details before publishing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Product Images */}
          {imagePreviewUrls.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={imagePreviewUrls[0]} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Product Details Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{title}</h3>
              <span className="text-2xl font-bold text-youbuy">{price ? `AED ${price}` : ''}</span>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Product Specifications</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {Object.entries(specifications).map(([key, value]) => {
                    // Skip empty values
                    if (!value) return null;

                    // Format dimensions
                    if (key === 'dimensions' && typeof value === 'object') {
                      const dims = value as { length: number; width: number; height: number };
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Dimensions:</span>
                          <span className="text-sm font-medium">
                            {dims.length} × {dims.width} × {dims.height} cm
                          </span>
                        </div>
                      );
                    }

                    // Format other specifications
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Information */}
            <div>
              <h4 className="font-medium mb-3">Shipping & Delivery</h4>
              <div className="space-y-2">
                {shippingOptions.inPersonMeetup && (
                  <div className="flex items-center text-sm">
                    <Package className="h-4 w-4 mr-2 text-youbuy" />
                    <span>In-person meetup available</span>
                  </div>
                )}
                {shippingOptions.platformShipping && (
                  <div className="flex items-center text-sm">
                    <Package className="h-4 w-4 mr-2 text-youbuy" />
                    <span>Platform shipping available</span>
                  </div>
                )}
                {weight && (
                  <div className="flex items-center text-sm">
                    <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Weight: {weight} kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4 pt-6 border-t">
            <h4 className="font-medium">Location & Pickup</h4>
            <div className="flex items-start space-x-4">
              <MapPin className="h-5 w-5 text-youbuy mt-0.5" />
              <div className="space-y-3 flex-1">
                <div className="text-sm">
                  {formatLocationDetails()}
                </div>
                {coordinates && (
                  <div className="h-[200px] rounded-md overflow-hidden border">
                    <LocationMap
                      latitude={coordinates.latitude}
                      longitude={coordinates.longitude}
                      height="200px"
                      interactive={false}
                      showMarker={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("location")}
        >
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => {}} className="hover:bg-transparent hover:text-foreground">
            How does it look?
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={uploading} 
            className="bg-youbuy hover:bg-youbuy-dark"
          >
            {uploading ? "Publishing..." : "Post Ad"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
