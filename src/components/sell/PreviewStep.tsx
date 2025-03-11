
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

interface PreviewStepProps {
  title: string;
  price: string;
  description: string;
  location: string;
  imagePreviewUrls: string[];
  specifications: ProductSpecifications;
  weight: string;
  coordinates: { latitude: number; longitude: number } | null;
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
  shippingOptions,
  setCurrentStep,
  handleSubmit,
  uploading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Your Listing</CardTitle>
        <CardDescription>
          Review your item details before publishing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border rounded-lg overflow-hidden">
            {imagePreviewUrls.length > 0 && (
              <div className="aspect-video relative">
                <img 
                  src={imagePreviewUrls[0]} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4 space-y-4">
              <h3 className="text-xl font-semibold">{title}</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">{price ? `AED ${price}` : ''}</span>
                <span className="text-sm text-muted-foreground">{location}</span>
              </div>
              
              {/* Location Map */}
              {coordinates && (
                <div className="h-[150px] rounded-md overflow-hidden">
                  <LocationMap
                    latitude={coordinates.latitude}
                    longitude={coordinates.longitude}
                    height="150px"
                    interactive={false}
                    showMarker={true}
                  />
                </div>
              )}
              
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm mt-1">{description}</p>
              </div>
              
              {Object.keys(specifications).length > 0 && (
                <div>
                  <h4 className="font-medium">Specifications</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                    {specifications.brand && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Brand:</span>
                        <span className="text-sm">{specifications.brand}</span>
                      </div>
                    )}
                    {specifications.condition && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Condition:</span>
                        <span className="text-sm">{specifications.condition}</span>
                      </div>
                    )}
                    {specifications.model && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Model:</span>
                        <span className="text-sm">{specifications.model}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium">Shipping</h4>
                <div className="text-sm mt-1">
                  {shippingOptions.inPersonMeetup && <p>✓ In-person meetup</p>}
                  {shippingOptions.platformShipping && (
                    <p>✓ Platform shipping</p>
                  )}
                  {weight && <p>Weight: {weight} kg</p>}
                </div>
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
          <Button variant="outline" onClick={() => {}}>
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
