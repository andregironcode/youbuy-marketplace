
import { useState } from "react";
import { ProductType, ProductVariation, ProductVariationOption } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tag, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  product: ProductType;
  onAddToCart?: () => void;
}

export const ProductDetails = ({ product, onAddToCart }: ProductDetailsProps) => {
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [price, setPrice] = useState(product.price);
  
  // Function to handle variation selection
  const handleVariationSelect = (variationId: string, optionId: string) => {
    const newSelections = { ...selectedVariations, [variationId]: optionId };
    setSelectedVariations(newSelections);
    
    // Recalculate price based on selected variations
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
  
  // Check if all required variations are selected
  const areAllRequiredVariationsSelected = () => {
    if (!product.variations) return true;
    
    return product.variations
      .filter(v => v.required)
      .every(v => selectedVariations[v.id]);
  };
  
  // Render the product status badge
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        {renderStatusBadge()}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-youbuy">
          AED {price.toFixed(2)}
        </span>
        {product.variations && Object.keys(selectedVariations).length > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            (Base price: AED {product.price.toFixed(2)})
          </span>
        )}
      </div>
      
      {/* Reserved notification */}
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
      
      <Separator />
      
      {/* Variations selection */}
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
      
      {/* Add to cart button - disabled based on product status or variation selection */}
      <Button 
        className="w-full bg-youbuy hover:bg-youbuy-dark mt-4"
        onClick={onAddToCart}
        disabled={
          product.status === 'sold' || 
          product.status === 'reserved' || 
          !areAllRequiredVariationsSelected()
        }
      >
        {product.status === 'sold' 
          ? 'Sold Out' 
          : product.status === 'reserved' 
            ? 'Reserved' 
            : 'Contact Seller'}
      </Button>
      
      {product.variations && product.variations.some(v => v.required) && !areAllRequiredVariationsSelected() && (
        <p className="text-xs text-destructive text-center">
          Please select all required options marked with *
        </p>
      )}
    </div>
  );
};
