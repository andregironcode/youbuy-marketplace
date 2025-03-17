import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface FilterAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterAccordion = ({ title, children, defaultOpen = false }: FilterAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b pb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 text-sm font-medium"
      >
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="pt-2 pb-1">
          {children}
        </div>
      )}
    </div>
  );
};

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: string[];
  totalResults?: number;
}

export const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  categories = [],
  totalResults = 0
}: FilterSidebarProps) => {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  // Sort options
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "recent");
  
  // Availability filter
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(searchParams.get("available") === "true");
  
  // Distance filter
  const [distance, setDistance] = useState<number>(
    Number(searchParams.get("distance")) || 50
  );
  
  // Active filters count
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  
  useEffect(() => {
    // Initialize from URL params
    const minPriceParam = searchParams.get("min_price");
    const maxPriceParam = searchParams.get("max_price");
    
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
    
    // Count active filters
    let count = 0;
    if (minPriceParam || maxPriceParam) count++;
    if (searchParams.get("sort") && searchParams.get("sort") !== "recent") count++;
    if (searchParams.get("available") === "true") count++;
    if (searchParams.get("distance") && searchParams.get("distance") !== "50") count++;
    
    setActiveFiltersCount(count);
  }, [searchParams]);
  
  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // Add price filters
    if (minPrice) newParams.set("min_price", minPrice);
    else newParams.delete("min_price");
    
    if (maxPrice) newParams.set("max_price", maxPrice);
    else newParams.delete("max_price");
    
    // Add sort option
    if (sortBy !== "recent") newParams.set("sort", sortBy);
    else newParams.delete("sort");
    
    // Add availability filter
    if (onlyAvailable) newParams.set("available", "true");
    else newParams.delete("available");
    
    // Add distance filter
    if (distance !== 50) newParams.set("distance", distance.toString());
    else newParams.delete("distance");
    
    setSearchParams(newParams);
    if (isMobile) onClose();
  };
  
  const handleResetFilters = () => {
    // Keep only search query and category params
    const newParams = new URLSearchParams();
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    
    if (query) newParams.set("q", query);
    if (category) newParams.set("category", category);
    
    setSearchParams(newParams);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("recent");
    setOnlyAvailable(false);
    setDistance(50);
  };
  
  const sidebarClass = cn(
    "fixed inset-y-0 right-0 w-80 max-w-full bg-white z-40 border-l shadow-lg transition-transform duration-300 transform",
    {
      "translate-x-0": isOpen,
      "translate-x-full": !isOpen
    }
  );
  
  return (
    <>
      {/* Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-30" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Filter sidebar */}
      <div className={sidebarClass}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 className="font-medium">Filters</h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Filters content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-5">
              {/* Sort Options */}
              <FilterAccordion title="Sort By" defaultOpen>
                <div className="space-y-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FilterAccordion>
              
              {/* Price Range */}
              <FilterAccordion title="Price Range" defaultOpen>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <label htmlFor="min-price" className="text-xs text-muted-foreground">Min</label>
                      <div className="flex items-center border rounded-md mt-1">
                        <span className="px-2 text-muted-foreground">AED</span>
                        <Input
                          id="min-price"
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="border-0 flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="max-price" className="text-xs text-muted-foreground">Max</label>
                      <div className="flex items-center border rounded-md mt-1">
                        <span className="px-2 text-muted-foreground">AED</span>
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="border-0 flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FilterAccordion>
              
              {/* Category Filter (only shown on search results, not category pages) */}
              {categories.length > 0 && (
                <FilterAccordion title="Categories">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={searchParams.get("category") === category}
                            onChange={() => {
                              const newParams = new URLSearchParams(searchParams);
                              newParams.set("category", category);
                              setSearchParams(newParams);
                            }}
                            className="rounded text-youbuy focus:ring-youbuy"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      </div>
                    ))}
                    {searchParams.get("category") && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs mt-1"
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.delete("category");
                          setSearchParams(newParams);
                        }}
                      >
                        Clear category
                      </Button>
                    )}
                  </div>
                </FilterAccordion>
              )}
              
              {/* Distance Filter */}
              <FilterAccordion title="Distance">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Distance: {distance} km</span>
                    </div>
                    <Slider
                      value={[distance]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={(value) => setDistance(value[0])}
                    />
                  </div>
                </div>
              </FilterAccordion>
              
              {/* Availability Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="available-only" className="text-sm font-medium cursor-pointer">
                    Available Items Only
                  </label>
                  <Switch
                    id="available-only"
                    checked={onlyAvailable}
                    onCheckedChange={setOnlyAvailable}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with action buttons */}
          <div className="p-4 border-t">
            <div className="space-y-2">
              <Button 
                variant="default" 
                className="w-full bg-youbuy hover:bg-youbuy-dark" 
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">{totalResults} results found</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
