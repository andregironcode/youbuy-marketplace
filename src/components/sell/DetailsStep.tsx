import React, { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProductFields } from "@/components/product/ProductFields";
import { ProductVariation, ProductSpecifications } from "@/types/product";
import { SellStep } from "@/types/sellForm";
import { useSellForm } from "@/context/SellFormContext";

interface DetailsStepProps {
  price: string;
  setPrice: (price: string) => void;
  description: string;
  setDescription: (description: string) => void;
  category: string;
  subcategory: string;
  subSubcategory: string;
  variations: ProductVariation[];
  setVariations: (variations: ProductVariation[]) => void;
  specifications: ProductSpecifications;
  setSpecifications: (specifications: ProductSpecifications) => void;
  showBulkListing: boolean;
  setShowBulkListing: (show: boolean) => void;
  isBulkListing: boolean;
  setIsBulkListing: (isBulk: boolean) => void;
  bulkQuantity: string;
  setBulkQuantity: (quantity: string) => void;
  setCurrentStep: (step: SellStep) => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  price,
  setPrice,
  description,
  setDescription,
  category,
  subcategory,
  subSubcategory,
  variations,
  setVariations,
  specifications,
  setSpecifications,
  showBulkListing,
  setShowBulkListing,
  isBulkListing,
  setIsBulkListing,
  bulkQuantity,
  setBulkQuantity,
  setCurrentStep,
}) => {
  const { updateFormData } = useSellForm();

  // Update form data whenever specifications change
  useEffect(() => {
    updateFormData({ specifications });
  }, [specifications, updateFormData]);

  // Update form data whenever variations change
  useEffect(() => {
    updateFormData({ variations });
  }, [variations, updateFormData]);

  // Update form data whenever bulk listing settings change
  useEffect(() => {
    updateFormData({ 
      isBulkListing,
      bulkQuantity,
      showBulkListing
    });
  }, [isBulkListing, bulkQuantity, showBulkListing, updateFormData]);

  const isPriceValid = parseFloat(price) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item information</CardTitle>
        <CardDescription>
          Provide details about your item to help it sell faster
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Be reasonable...</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="AED">
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Describe your item in detail"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={640}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Add relevant information such as condition, model, color...</span>
              <span>{description.length}/640</span>
            </div>
          </div>
          
          {category && (
            <div className="pt-2 border-t">
              <ProductFields 
                category={category} 
                subcategory={subcategory}
                subSubcategory={subSubcategory}
                onVariationsChange={setVariations}
                initialVariations={variations}
                onSpecificationsChange={setSpecifications}
                initialSpecifications={specifications}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium">List multiple identical items</h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Premium</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBulkListing(!showBulkListing)}
              className="ml-auto"
            >
              {showBulkListing ? "Hide" : "Show"}
            </Button>
          </div>
          
          {showBulkListing && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <p className="text-sm">Bulk listing is a premium feature that allows you to list multiple identical items at once.</p>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <Switch 
                  id="bulk-listing"
                  checked={isBulkListing}
                  onCheckedChange={setIsBulkListing}
                />
                <Label htmlFor="bulk-listing">Enable bulk listing</Label>
              </div>
              
              {isBulkListing && (
                <div className="mt-3 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="bulkQuantity">Number of items</Label>
                    <Input 
                      id="bulkQuantity" 
                      type="number" 
                      value={bulkQuantity} 
                      onChange={(e) => setBulkQuantity(e.target.value)}
                      min="2"
                      max="100"
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    Each item will be listed separately
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("category")}
        >
          Back
        </Button>
        <Button 
          disabled={!isPriceValid} 
          onClick={() => setCurrentStep("photos")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
