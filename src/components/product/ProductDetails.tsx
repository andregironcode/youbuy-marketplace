import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductType } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tag, Check, AlertTriangle, Info, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailsProps {
  product: ProductType;
  onAddToCart?: () => void;
  isOwnProduct?: boolean;
}

export const ProductDetails = ({ product, onAddToCart, isOwnProduct }: ProductDetailsProps) => {
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [price, setPrice] = useState(product.price);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleVariationSelect = (variationId: string, optionId: string) => {
    const newSelections = { ...selectedVariations, [variationId]: optionId };
    setSelectedVariations(newSelections);
    
    if (product.variations) {
      let newPrice = product.price;
      
      product.variations.forEach(variation => {
        const selectedOptionId = newSelections[variation.id];
        if (selectedOptionId) {
          const option = variation.options.find(o => o.id === selectedOptionId);
          if (option && option.additionalPrice) {
            newPrice += option.additionalPrice;
          }
        }
      });
      
      setPrice(newPrice);
    }
  };
  
  const areAllRequiredVariationsSelected = () => {
    if (!product.variations) return true;
    
    return product.variations
      .filter(v => v.required)
      .every(v => selectedVariations[v.id]);
  };
  
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this item",
        variant: "destructive"
      });
      navigate("/auth?redirect=/product/" + product.id);
      return;
    }
    
    if (product.id) {
      navigate(`/checkout/${product.id}`);
    }
  };
  
  const renderStatusBadge = () => {
    if (!product.status || product.status === 'available') return null;
    
    if (product.status === 'reserved') {
      return (
        <Badge className="bg-amber-500 text-white">
          <Tag className="h-3 w-3 mr-1" />
          Reserved
        </Badge>
      );
    }
    
    if (product.status === 'sold') {
      return (
        <Badge className="bg-gray-500 text-white">
          <Check className="h-3 w-3 mr-1" />
          Sold
        </Badge>
      );
    }
    
    return null;
  };

  const renderSpecifications = () => {
    if (!product.specifications || Object.keys(product.specifications).length === 0) {
      return null;
    }

    const getSpecificationName = (key: string): string => {
      const nameMap: Record<string, string> = {
        brand: "Brand",
        model: "Model",
        condition: "Condition",
        screenSize: "Screen Size",
        resolution: "Resolution",
        smartTv: "Smart TV",
        storage: "Storage",
        processor: "Processor",
        ram: "RAM",
        camera: "Camera",
        computerType: "Type",
        graphics: "Graphics",
        operatingSystem: "OS",
        material: "Material",
        dimensions: "Dimensions"
      };
      return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    const formatSpecValue = (key: string, value: any): string => {
      if (key === "condition") {
        const conditionMap: Record<string, string> = {
          "new": "New (never used)",
          "like-new": "Like New",
          "excellent": "Excellent",
          "good": "Good",
          "fair": "Fair",
          "salvage": "For parts or not working"
        };
        return conditionMap[value] || value;
      }
      
      if (key === "screenSize" && value) {
        return `${value}" (${Math.round(value * 2.54)} cm)`;
      }
      
      if (key === "resolution") {
        const resolutionMap: Record<string, string> = {
          "hd": "HD (720p)",
          "fullhd": "Full HD (1080p)",
          "4k": "4K Ultra HD",
          "8k": "8K"
        };
        return resolutionMap[value] || value;
      }
      
      if (key === "smartTv") {
        const smartTvMap: Record<string, string> = {
          "none": "None (Regular TV)",
          "basic": "Basic Smart Features",
          "full": "Full Smart TV"
        };
        return smartTvMap[value] || value;
      }
      
      if (key === "computerType") {
        const computerTypeMap: Record<string, string> = {
          "desktop": "Desktop",
          "laptop": "Laptop",
          "tablet": "Tablet",
          "all-in-one": "All-in-One"
        };
        return computerTypeMap[value] || value;
      }
      
      if (key === "dimensions" && value) {
        return `${value.length} × ${value.width} × ${value.height} cm`;
      }
      
      return String(value);
    };

    const specsToShow = Object.entries(product.specifications)
      .filter(([_, value]) => value !== undefined && value !== "" && value !== null)
      .sort(([keyA], [keyB]) => {
        const priority = ["brand", "model", "condition", "computerType"];
        const indexA = priority.indexOf(keyA);
        const indexB = priority.indexOf(keyB);
        
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

    if (specsToShow.length === 0) return null;

    return (
      <div className="mt-4">
        <h3 className="font-medium flex items-center mb-3">
          <Info className="h-4 w-4 mr-1.5" />
          Specifications
        </h3>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specsToShow.map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground mb-1">
                    {getSpecificationName(key)}
                  </span>
                  <span className="text-sm">{formatSpecValue(key, value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        {renderStatusBadge()}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-price">
          AED {price.toFixed(2)}
        </span>
        {product.variations && Object.keys(selectedVariations).length > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            (Base price: AED {product.price.toFixed(2)})
          </span>
        )}
      </div>
      
      {product.status === 'reserved' && product.reservedUntil && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium">
                This item is reserved until {new Date(product.reservedUntil).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                It may become available after this date if the buyer doesn't complete the purchase.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {renderSpecifications()}
      
      <Separator />
      
      {product.variations && product.variations.length > 0 && (
        <div className="space-y-6">
          {product.variations.map(variation => (
            <div key={variation.id} className="space-y-3">
              <h3 className="font-medium">
                {variation.type === 'custom' ? variation.name : 
                  variation.type.charAt(0).toUpperCase() + variation.type.slice(1)}
                {variation.required && <span className="text-red-500">*</span>}
              </h3>
              
              <RadioGroup
                value={selectedVariations[variation.id] || ''}
                onValueChange={(value) => handleVariationSelect(variation.id, value)}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {variation.options.map(option => (
                    <div key={option.id} className="relative">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="peer sr-only"
                        disabled={!option.available}
                      />
                      <Label
                        htmlFor={option.id}
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-youbuy peer-data-[state=checked]:text-youbuy ${
                          !option.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {option.image && (
                          <img
                            src={option.image}
                            alt={option.value}
                            className="h-10 w-10 object-cover mb-2 rounded"
                          />
                        )}
                        <span className="text-sm">{option.value}</span>
                        {option.additionalPrice !== undefined && option.additionalPrice > 0 && (
                          <span className="text-xs text-muted-foreground mt-1">
                            +AED {option.additionalPrice.toFixed(2)}
                          </span>
                        )}
                        {!option.available && (
                          <span className="text-xs text-destructive mt-1">Out of stock</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}
          
          <Separator />
        </div>
      )}
      
      <div>
        <h2 className="font-medium mb-2">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
      </div>
      
      <Button 
        className="w-full mt-4"
        variant="default"
        style={{ backgroundColor: "#4CD137" }}
        disabled={
          product.status === 'sold' || 
          product.status === 'reserved' || 
          !areAllRequiredVariationsSelected()
        }
        onClick={handleBuyNow}
      >
        {product.status === 'sold' 
          ? 'Sold Out' 
          : product.status === 'reserved' 
            ? 'Reserved' 
            : <><ShoppingBag className="mr-2 h-5 w-5" />Buy Now</>}
      </Button>
      
      {product.variations && product.variations.some(v => v.required) && !areAllRequiredVariationsSelected() && (
        <p className="text-xs text-destructive text-center">
          Please select all required options marked with *
        </p>
      )}
    </div>
  );
};
