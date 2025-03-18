
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PriceRangeFilterProps {
  onPriceRangeChange: (priceRange: { min: number | null; max: number | null }) => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  onPriceRangeChange,
}) => {
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [error, setError] = useState<string>('');

  const applyFilter = () => {
    setError('');
    
    // Convert to numbers
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    
    // Validation
    if (min !== null && max !== null && min > max) {
      setError('Min price cannot be greater than max price');
      return;
    }
    
    onPriceRangeChange({ min, max });
  };
  
  const clearFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setError('');
    onPriceRangeChange({ min: null, max: null });
  };

  // Input validation
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setMaxPrice(value);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Price Range</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Min"
              value={minPrice}
              onChange={handleMinPriceChange}
              className="w-full"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="text"
              placeholder="Max"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="w-full"
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex space-x-2">
            <Button 
              onClick={applyFilter} 
              variant="default" 
              size="sm"
              className="flex-1"
            >
              Apply
            </Button>
            <Button 
              onClick={clearFilter} 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
