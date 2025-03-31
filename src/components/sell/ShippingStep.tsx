
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
import { ArrowRight, Info, Scale, Package, UserRound, Truck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { SellStep } from "@/types/sellForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShippingStepProps {
  weight: string;
  setWeight: (weight: string) => void;
  shippingOptions: {
    inPersonMeetup: boolean;
    platformShipping: boolean;
    shippingCost: number;
  };
  setShippingOptions: (options: {
    inPersonMeetup: boolean;
    platformShipping: boolean;
    shippingCost: number;
  }) => void;
  setCurrentStep: (step: SellStep) => void;
}

export const ShippingStep: React.FC<ShippingStepProps> = ({
  weight,
  setWeight,
  shippingOptions,
  setShippingOptions,
  setCurrentStep,
}) => {
  const isShippingValid = weight !== "";

  // Calculate estimated shipping cost based on weight
  const getShippingCost = (weightRange: string): number => {
    switch (weightRange) {
      case "0-1": return 4.99;
      case "1-2": return 7.99;
      case "2-5": return 12.99;
      case "5-10": return 18.99;
      case "10-20": return 24.99;
      case "20+": return 29.99;
      default: return 0;
    }
  };

  // Update shipping options when weight changes
  const handleWeightChange = (newWeight: string) => {
    setWeight(newWeight);
    const cost = getShippingCost(newWeight);
    setShippingOptions({
      ...shippingOptions,
      platformShipping: true,
      shippingCost: cost
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
        <CardDescription>
          Provide shipping details to help with delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert className="bg-blue-50 border border-blue-200 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Shipping is provided through our <strong>Shipday</strong> integration. We just need some details about your item.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-gray-500" />
              <Label>How much does the item weigh?</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Choose the weight range corresponding to your item. Please consider the weight of the packaging too.
            </p>
            
            <RadioGroup value={weight} onValueChange={handleWeightChange} className="space-y-2">
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-1" id="weight-1" />
                  <Label htmlFor="weight-1">0 to 1 kg</Label>
                </div>
                <div className="text-sm font-medium">$4.99</div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-2" id="weight-2" />
                  <Label htmlFor="weight-2">1 to 2 kg</Label>
                </div>
                <div className="text-sm font-medium">$7.99</div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2-5" id="weight-3" />
                  <Label htmlFor="weight-3">2 to 5 kg</Label>
                </div>
                <div className="text-sm font-medium">$12.99</div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5-10" id="weight-4" />
                  <Label htmlFor="weight-4">5 to 10 kg</Label>
                </div>
                <div className="text-sm font-medium">$18.99</div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10-20" id="weight-5" />
                  <Label htmlFor="weight-5">10 to 20 kg</Label>
                </div>
                <div className="text-sm font-medium">$24.99</div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="20+" id="weight-6" />
                  <Label htmlFor="weight-6">Over 20 kg</Label>
                </div>
                <div className="text-sm font-medium">$29.99</div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <Label>Product Dimensions (cm)</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Enter the approximate dimensions of your item
            </p>
            <div className="grid grid-cols-3 gap-3 pl-7">
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Input id="length" placeholder="cm" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" placeholder="cm" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" placeholder="cm" type="number" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-500" />
              <Label>Shipping Method</Label>
            </div>
            <div className="space-y-2 pl-7">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="platform-shipping" 
                  checked={shippingOptions.platformShipping}
                  onCheckedChange={(checked) => setShippingOptions({...shippingOptions, platformShipping: checked})}
                />
                <Label htmlFor="platform-shipping">Use platform shipping (Shipday delivery)</Label>
              </div>
              {shippingOptions.platformShipping && (
                <p className="text-sm text-muted-foreground ml-7">
                  Estimated shipping cost: ${shippingOptions.shippingCost.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-gray-500" />
              <Label>Additional delivery option</Label>
            </div>
            <div className="space-y-2 pl-7">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="meetup" 
                  checked={shippingOptions.inPersonMeetup}
                  onCheckedChange={(checked) => setShippingOptions({...shippingOptions, inPersonMeetup: checked})}
                />
                <Label htmlFor="meetup">I also want to offer in-person meetup</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("photos")}
        >
          Back
        </Button>
        <Button 
          disabled={!isShippingValid} 
          onClick={() => setCurrentStep("location")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
