
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin } from "lucide-react";
import { SellStep } from "@/types/sellForm";

interface LocationStepProps {
  location: string;
  setLocation: (location: string) => void;
  setCurrentStep: (step: SellStep) => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  location,
  setLocation,
  setCurrentStep,
}) => {
  const isLocationValid = location.length >= 3;

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
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location" 
                placeholder="Enter address or area"
                className={`pl-10 ${!isLocationValid && location.length > 0 ? "border-red-500" : ""}`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            {location.length > 0 && !isLocationValid && (
              <p className="text-xs text-red-500">Please enter a valid location (at least 3 characters)</p>
            )}
          </div>
          
          <div className="bg-muted h-48 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Map preview would appear here</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            This is the spot where your profile is located. We will show all your products here.
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
