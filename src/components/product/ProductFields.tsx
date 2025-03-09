
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus, X } from "lucide-react";
import { ProductVariation, ProductVariationOption } from "@/types/product";

interface ProductFieldsProps {
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  onVariationsChange?: (variations: ProductVariation[]) => void;
  initialVariations?: ProductVariation[];
}

export const ProductFields = ({ 
  category, 
  subcategory,
  subSubcategory,
  onVariationsChange,
  initialVariations = []
}: ProductFieldsProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>(initialVariations);
  const [activeTab, setActiveTab] = useState<string>("details");

  useEffect(() => {
    if (onVariationsChange) {
      onVariationsChange(variations);
    }
  }, [variations, onVariationsChange]);

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: crypto.randomUUID(),
      type: 'custom',
      name: 'Custom',
      options: [
        {
          id: crypto.randomUUID(),
          value: '',
          available: true
        }
      ],
      required: true
    };
    setVariations([...variations, newVariation]);
  };

  const removeVariation = (variationId: string) => {
    setVariations(variations.filter(v => v.id !== variationId));
  };

  const updateVariation = (variationId: string, data: Partial<ProductVariation>) => {
    setVariations(variations.map(v => {
      if (v.id === variationId) {
        return { ...v, ...data };
      }
      return v;
    }));
  };

  const addOption = (variationId: string) => {
    setVariations(variations.map(v => {
      if (v.id === variationId) {
        return {
          ...v,
          options: [
            ...v.options,
            {
              id: crypto.randomUUID(),
              value: '',
              available: true
            }
          ]
        };
      }
      return v;
    }));
  };

  const removeOption = (variationId: string, optionId: string) => {
    setVariations(variations.map(v => {
      if (v.id === variationId) {
        return {
          ...v,
          options: v.options.filter(o => o.id !== optionId)
        };
      }
      return v;
    }));
  };

  const updateOption = (variationId: string, optionId: string, data: Partial<ProductVariationOption>) => {
    setVariations(variations.map(v => {
      if (v.id === variationId) {
        return {
          ...v,
          options: v.options.map(o => {
            if (o.id === optionId) {
              return { ...o, ...data };
            }
            return o;
          })
        };
      }
      return v;
    }));
  };

  // Render product variations UI
  const renderVariations = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Variations</h3>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addVariation} 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variation
          </Button>
        </div>

        {variations.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-md">
            <p className="text-muted-foreground">No variations added yet. Add variations if your product comes in different options like sizes or colors.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {variations.map(variation => (
              <Card key={variation.id} className="border border-input">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Select 
                        value={variation.type} 
                        onValueChange={(value) => updateVariation(variation.id, { 
                          type: value as 'color' | 'size' | 'style' | 'material' | 'custom',
                          name: value === 'custom' ? 'Custom' : value.charAt(0).toUpperCase() + value.slice(1)
                        })}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="size">Size</SelectItem>
                          <SelectItem value="style">Style</SelectItem>
                          <SelectItem value="material">Material</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {variation.type === 'custom' && (
                        <Input 
                          value={variation.name} 
                          onChange={(e) => updateVariation(variation.id, { name: e.target.value })} 
                          className="w-[150px]"
                          placeholder="Variation name"
                        />
                      )}
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeVariation(variation.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground">
                      <div className="col-span-5">Value</div>
                      <div className="col-span-3">Price Modifier</div>
                      <div className="col-span-3">Stock</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    {variation.options.map(option => (
                      <div key={option.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <Input 
                            value={option.value} 
                            onChange={(e) => updateOption(variation.id, option.id, { value: e.target.value })} 
                            placeholder={`${variation.type === 'custom' ? variation.name : variation.type} value`}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input 
                            type="number" 
                            value={option.additionalPrice !== undefined ? option.additionalPrice : ''} 
                            onChange={(e) => updateOption(variation.id, option.id, { 
                              additionalPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                            })} 
                            placeholder="+ AED"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input 
                            type="number" 
                            value={option.stockQuantity !== undefined ? option.stockQuantity : ''} 
                            onChange={(e) => updateOption(variation.id, option.id, { 
                              stockQuantity: e.target.value ? parseInt(e.target.value) : undefined,
                              available: e.target.value ? parseInt(e.target.value) > 0 : true
                            })} 
                            placeholder="Quantity"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => removeOption(variation.id, option.id)}
                            disabled={variation.options.length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => addOption(variation.id)} 
                      size="sm" 
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Main render function
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Product Details</TabsTrigger>
        <TabsTrigger value="variations">Variations</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="mt-4 space-y-4">
        {/* Original category-specific fields */}
        {category === "electronics" && subcategory === "televisions" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="e.g., Samsung, LG, Sony" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenSize">Screen Size (inches)</Label>
              <Input id="screenSize" type="number" placeholder="e.g., 55" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select>
                <SelectTrigger id="resolution">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hd">HD (720p)</SelectItem>
                  <SelectItem value="fullhd">Full HD (1080p)</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                  <SelectItem value="8k">8K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (never used)</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="salvage">For parts or not working</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smartTv">Smart TV Features</Label>
              <Select>
                <SelectTrigger id="smartTv">
                  <SelectValue placeholder="Select smart TV features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Regular TV)</SelectItem>
                  <SelectItem value="basic">Basic Smart Features</SelectItem>
                  <SelectItem value="full">Full Smart TV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Generic electronics fields as fallback */}
        {category === "electronics" && subcategory !== "televisions" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="e.g., Samsung, Apple, Sony" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="e.g., Galaxy S21, MacBook Pro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (never used)</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="salvage">For parts or not working</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Mobile phones & tablets fields */}
        {category === "mobile" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="e.g., Apple, Samsung, Google" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="e.g., iPhone 13, Galaxy S21" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Storage Capacity</Label>
              <Select>
                <SelectTrigger id="storage">
                  <SelectValue placeholder="Select storage capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">16GB</SelectItem>
                  <SelectItem value="32">32GB</SelectItem>
                  <SelectItem value="64">64GB</SelectItem>
                  <SelectItem value="128">128GB</SelectItem>
                  <SelectItem value="256">256GB</SelectItem>
                  <SelectItem value="512">512GB</SelectItem>
                  <SelectItem value="1024">1TB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (never used)</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="salvage">For parts or not working</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Furniture fields */}
        {category === "furniture" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input id="material" placeholder="e.g., Wood, Glass, Metal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input id="length" placeholder="Length" />
                <Input id="width" placeholder="Width" />
                <Input id="height" placeholder="Height" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (never used)</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="salvage">For parts or not working</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Default fields for other categories */}
        {!["electronics", "mobile", "furniture"].includes(category) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (never used)</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="salvage">For parts or not working</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="variations" className="mt-4">
        {renderVariations()}
      </TabsContent>
    </Tabs>
  );
};
