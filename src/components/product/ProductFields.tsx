import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus, X, Info } from "lucide-react";
import { ProductVariation, ProductVariationOption, ProductSpecifications } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface ProductFieldsProps {
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  onVariationsChange?: (variations: ProductVariation[]) => void;
  initialVariations?: ProductVariation[];
  onSpecificationsChange?: (specifications: ProductSpecifications) => void;
  initialSpecifications?: ProductSpecifications;
}

export const ProductFields = ({ 
  category, 
  subcategory,
  subSubcategory,
  onVariationsChange,
  initialVariations = [],
  onSpecificationsChange,
  initialSpecifications = {}
}: ProductFieldsProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>(initialVariations);
  const [specifications, setSpecifications] = useState<ProductSpecifications>(initialSpecifications);
  const [showVariations, setShowVariations] = useState(false);

  useEffect(() => {
    if (onVariationsChange) {
      onVariationsChange(variations);
    }
  }, [variations, onVariationsChange]);

  useEffect(() => {
    if (onSpecificationsChange) {
      onSpecificationsChange(specifications);
    }
  }, [specifications, onSpecificationsChange]);

  // Handler for updating specifications
  const updateSpecification = (key: keyof ProductSpecifications, value: any) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Product Variations</h3>
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Premium</Badge>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowVariations(!showVariations)} 
            size="sm"
          >
            {showVariations ? "Hide Variations" : "Show Variations"}
          </Button>
        </div>

        {showVariations && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
              <p>Product variations are a premium feature. They allow you to list different options like colors or sizes for your product.</p>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={addVariation} 
              size="sm"
              className="mb-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variation
            </Button>

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
          </>
        )}
      </div>
    );
  };

  // Get common brands for a specific category
  const getCategoryBrands = () => {
    if (category === "electronics") {
      if (subcategory === "televisions") {
        return ["Samsung", "LG", "Sony", "TCL", "Hisense", "Philips", "Panasonic", "Vizio", "Sharp", "Other"];
      } else if (subcategory === "computers" || subcategory === "laptops") {
        return ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI", "Razer", "Alienware", "Other"];
      } else if (subcategory === "audio") {
        return ["Sony", "Bose", "JBL", "Sennheiser", "Apple", "Samsung", "Beats", "Audio-Technica", "Anker", "Other"];
      }
      return ["Samsung", "Apple", "Sony", "LG", "Philips", "Panasonic", "Dell", "HP", "Lenovo", "Other"];
    } else if (category === "mobile") {
      return ["Apple", "Samsung", "Google", "Xiaomi", "Huawei", "OnePlus", "Oppo", "Vivo", "Motorola", "Nokia", "Other"];
    }
    return [];
  };

  // Brand selector component
  const renderBrandSelector = () => {
    const brands = getCategoryBrands();
    if (brands.length === 0) return null;

    return (
      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Select 
          value={specifications.brand || ""} 
          onValueChange={(value) => updateSpecification("brand", value)}
        >
          <SelectTrigger id="brand">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand.toLowerCase()}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Main render function
  return (
    <div className="space-y-8">
      {/* Base Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Condition</h3>
        <div className="space-y-2">
          <Label htmlFor="condition">Product Condition</Label>
          <Select 
            value={specifications.condition || ""} 
            onValueChange={(value: any) => updateSpecification("condition", value)}
          >
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
      
      {/* Specifications Section */}
      {(category === "electronics" || category === "mobile" || category === "furniture") && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Specifications</h3>
          
          {/* Brand selector for appropriate categories */}
          {renderBrandSelector()}
          
          {/* Televisions specific fields */}
          {category === "electronics" && subcategory === "televisions" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="screenSize">Screen Size (inches)</Label>
                <Input 
                  id="screenSize" 
                  type="number" 
                  placeholder="e.g., 55" 
                  value={specifications.screenSize || ""}
                  onChange={(e) => updateSpecification("screenSize", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Select 
                  value={specifications.resolution || ""} 
                  onValueChange={(value: any) => updateSpecification("resolution", value)}
                >
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
                <Label htmlFor="smartTv">Smart TV Features</Label>
                <Select 
                  value={specifications.smartTv || ""} 
                  onValueChange={(value: any) => updateSpecification("smartTv", value)}
                >
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
          
          {/* Computer specific fields */}
          {category === "electronics" && (subcategory === "computers" || subcategory === "laptops") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="computerType">Computer Type</Label>
                <Select 
                  value={specifications.computerType || ""} 
                  onValueChange={(value: any) => updateSpecification("computerType", value)}
                >
                  <SelectTrigger id="computerType">
                    <SelectValue placeholder="Select computer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="all-in-one">All-in-One</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  placeholder="e.g., MacBook Pro, Inspiron 15" 
                  value={specifications.model || ""}
                  onChange={(e) => updateSpecification("model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processor">Processor</Label>
                <Input 
                  id="processor" 
                  placeholder="e.g., Intel i7, AMD Ryzen 5" 
                  value={specifications.processor || ""}
                  onChange={(e) => updateSpecification("processor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input 
                  id="ram" 
                  placeholder="e.g., 16GB" 
                  value={specifications.ram || ""}
                  onChange={(e) => updateSpecification("ram", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Input 
                  id="storage" 
                  placeholder="e.g., 512GB SSD" 
                  value={specifications.storage || ""}
                  onChange={(e) => updateSpecification("storage", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graphics">Graphics</Label>
                <Input 
                  id="graphics" 
                  placeholder="e.g., NVIDIA RTX 3080, Intel Iris" 
                  value={specifications.graphics || ""}
                  onChange={(e) => updateSpecification("graphics", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatingSystem">Operating System</Label>
                <Input 
                  id="operatingSystem" 
                  placeholder="e.g., Windows 11, macOS, Linux" 
                  value={specifications.operatingSystem || ""}
                  onChange={(e) => updateSpecification("operatingSystem", e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Mobile phones & tablets fields */}
          {category === "mobile" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  placeholder="e.g., iPhone 13, Galaxy S21" 
                  value={specifications.model || ""}
                  onChange={(e) => updateSpecification("model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage Capacity</Label>
                <Select 
                  value={specifications.storage || ""} 
                  onValueChange={(value) => updateSpecification("storage", value)}
                >
                  <SelectTrigger id="storage">
                    <SelectValue placeholder="Select storage capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16GB">16GB</SelectItem>
                    <SelectItem value="32GB">32GB</SelectItem>
                    <SelectItem value="64GB">64GB</SelectItem>
                    <SelectItem value="128GB">128GB</SelectItem>
                    <SelectItem value="256GB">256GB</SelectItem>
                    <SelectItem value="512GB">512GB</SelectItem>
                    <SelectItem value="1TB">1TB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera">Camera</Label>
                <Input 
                  id="camera" 
                  placeholder="e.g., 12MP dual camera" 
                  value={specifications.camera || ""}
                  onChange={(e) => updateSpecification("camera", e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Furniture fields */}
          {category === "furniture" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input 
                  id="material" 
                  placeholder="e.g., Wood, Glass, Metal" 
                  value={specifications.material || ""}
                  onChange={(e) => updateSpecification("material", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    id="length" 
                    placeholder="Length" 
                    value={specifications.dimensions?.length || ""}
                    onChange={(e) => {
                      const currentDimensions = specifications.dimensions || { length: 0, width: 0, height: 0 };
                      updateSpecification("dimensions", {
                        ...currentDimensions,
                        length: e.target.value ? parseFloat(e.target.value) : 0
                      });
                    }}
                  />
                  <Input 
                    id="width" 
                    placeholder="Width" 
                    value={specifications.dimensions?.width || ""}
                    onChange={(e) => {
                      const currentDimensions = specifications.dimensions || { length: 0, width: 0, height: 0 };
                      updateSpecification("dimensions", {
                        ...currentDimensions,
                        width: e.target.value ? parseFloat(e.target.value) : 0
                      });
                    }}
                  />
                  <Input 
                    id="height" 
                    placeholder="Height" 
                    value={specifications.dimensions?.height || ""}
                    onChange={(e) => {
                      const currentDimensions = specifications.dimensions || { length: 0, width: 0, height: 0 };
                      updateSpecification("dimensions", {
                        ...currentDimensions,
                        height: e.target.value ? parseFloat(e.target.value) : 0
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Variations Section */}
      <div className="pt-4 border-t">
        {renderVariations()}
      </div>
    </div>
  );
};
