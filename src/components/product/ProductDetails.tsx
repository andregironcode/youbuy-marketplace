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
import { useCurrency } from "@/context/CurrencyContext";

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
  const { formatCurrency } = useCurrency();
  
  const handleVariationSelect = (variationId: string, optionId: string) => {
    const newSelections = { ...selectedVariations, [variationId]: optionId };
    setSelectedVariations(newSelections);
    
    if (product.variations) {
      // Convert initial price to number
      let newPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      
      product.variations.forEach(variation => {
        const selectedOptionId = newSelections[variation.id];
        if (selectedOptionId) {
          const option = variation.options.find(o => o.id === selectedOptionId);
          if (option && option.additionalPrice) {
            newPrice += option.additionalPrice;
          }
        }
      });
      
      // Set the price as a string to match the product.price type
      setPrice(newPrice.toString());
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
    if (product.product_status === 'reserved') {
      return (
        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200">
          Reserved
        </Badge>
      );
    } else if (product.product_status === 'sold') {
      return (
        <Badge variant="destructive" className="text-xs">
          Sold
        </Badge>
      );
    }
    
    return null;
  };
  
  const renderSpecifications = () => {
    if (!product.specifications) return null;
    
    const specs = product.specifications;
    const mainSpecs = ['condition', 'brand', 'model'];
    
    // First show the main specifications
    const mainSpecsList = mainSpecs
      .filter(key => specs[key])
      .map(key => (
        <div key={key} className="flex justify-between items-center py-2">
          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          <span className="text-sm font-medium">{formatSpecValue(key, specs[key])}</span>
        </div>
      ));
    
    // Then show the rest
    const otherSpecsList = Object.entries(specs)
      .filter(([key]) => !mainSpecs.includes(key))
      .map(([key, value]) => (
        <div key={key} className="flex justify-between items-center py-2">
          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          <span className="text-sm font-medium">{formatSpecValue(key, value)}</span>
        </div>
      ));
    
    if (mainSpecsList.length === 0 && otherSpecsList.length === 0) {
      return null;
    }
    
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Specifications</h3>
        <Card>
          <CardContent className="p-4">
            {mainSpecsList}
            {mainSpecsList.length > 0 && otherSpecsList.length > 0 && (
              <Separator className="my-2" />
            )}
            {otherSpecsList}
          </CardContent>
        </Card>
      </div>
    );
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
  
  // Render variations if available
  const renderVariations = () => {
    if (!product.variations || product.variations.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Options</h3>
        
        {product.variations.map((variation, index) => (
          <div key={variation.id} className="space-y-2">
            <div className="flex justify-between">
              <Label className="font-medium">{variation.name}</Label>
              {variation.required && (
                <span className="text-xs text-destructive">Required</span>
              )}
            </div>
            
            <RadioGroup 
              onValueChange={(value) => handleVariationSelect(variation.id, value)}
              value={selectedVariations[variation.id]}
              className="grid grid-cols-2 gap-2"
            >
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
                    className={`
                      flex items-center justify-between p-2 border rounded-md cursor-pointer
                      transition-all hover:border-primary
                      peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-50
                    `}
                  >
                    <div>
                      <span className="text-sm">{option.value}</span>
                      {option.additionalPrice && option.additionalPrice > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +AED {option.additionalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {option.available ? (
                      <Check className="text-primary w-4 h-4 opacity-0 peer-data-[state=checked]:opacity-100" />
                    ) : (
                      <span className="text-xs text-destructive">Out of stock</span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {index < product.variations.length - 1 && <Separator />}
          </div>
        ))}
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
          AED {formatCurrency(price)}
        </span>
        {product.variations && Object.keys(selectedVariations).length > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            (Base price: AED {formatCurrency(product.price)})
          </span>
        )}
      </div>
      
      {product.product_status === 'reserved' && product.reservedUntil && (
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
      
      {renderVariations()}
      
      <div className="pt-4">
        <Button
          size="lg"
          className="w-full mb-2"
          disabled={!areAllRequiredVariationsSelected() || product.product_status === 'sold' || isOwnProduct}
          onClick={handleBuyNow}
        >
          <ShoppingBag className="mr-2 h-5 w-5" /> Buy Now
        </Button>
        
        {(product.product_status === 'sold' || isOwnProduct) && (
          <div className="text-center text-sm text-muted-foreground">
            {isOwnProduct ? "This is your product" : "This item has been sold"}
          </div>
        )}
      </div>
    </div>
  );
};
