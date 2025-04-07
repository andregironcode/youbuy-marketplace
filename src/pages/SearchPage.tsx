import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { searchProducts, getAllCategories, countActiveFilters, getUserLocation } from "@/utils/searchUtils";
import { ProductType } from "@/types/product";
import { Loader2, Tag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { FilterToggle } from "@/components/filters/FilterToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const isMobile = useIsMobile();
  
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get user location when distance filter is applied
  useEffect(() => {
    const distanceParam = searchParams.get("distance");
    
    if (distanceParam && !userLocation) {
      setLocationLoading(true);
      getUserLocation()
        .then(location => {
          setUserLocation(location);
          if (!location) {
            toast.error("Could not access your location. Distance filtering may not work correctly.");
          }
        })
        .catch(error => {
          console.error("Error getting location:", error);
          toast.error("Error accessing your location. Please enable location services.");
        })
        .finally(() => {
          setLocationLoading(false);
        });
    }
  }, [searchParams, userLocation]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      // Get all filters from URL params
      const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
      const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
      const sortBy = searchParams.get("sort") || "recent";
      const distance = searchParams.get("distance") ? Number(searchParams.get("distance")) : undefined;
      const onlyAvailable = searchParams.get("available") === "true";
      const time = searchParams.get("time");
      
      try {
        // Fetch products with filters
        const results = await searchProducts({
          query,
          category,
          minPrice,
          maxPrice,
          sortBy,
          distance,
          onlyAvailable,
          userLocation,
          time
        });
        
        setProducts(results);
        
        // Fetch all categories for filter options if not already loaded
        if (categories.length === 0) {
          const allCategories = await getAllCategories();
          setCategories(allCategories);
        }
        
        // Count active filters
        setActiveFiltersCount(countActiveFilters(searchParams));
      } catch (error) {
        console.error("Error searching products:", error);
        toast.error("Error searching products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, query, category, categories.length, userLocation]);

  const getSearchTitle = () => {
    if (category && query) {
      return `"${query}" in ${category}`;
    } else if (category) {
      return category;
    } else if (query) {
      return `"${query}"`;
    } else {
      return "All Products";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">Search Results</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">
                  {products.length > 0
                    ? `Showing ${products.length} results for ${getSearchTitle()}`
                    : `No results found for ${getSearchTitle()}`}
                </p>
                {category && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {category}
                  </Badge>
                )}
                {searchParams.get("distance") && userLocation && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Within {searchParams.get("distance")} km
                  </Badge>
                )}
              </div>
            </div>
            
            <FilterToggle 
              onClick={() => setIsFilterOpen(true)} 
              activeFiltersCount={activeFiltersCount}
            />
          </div>
          
          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchParams.get("min_price") && (
                <Badge variant="secondary" className="rounded-full">
                  Min: AED {searchParams.get("min_price")}
                </Badge>
              )}
              {searchParams.get("max_price") && (
                <Badge variant="secondary" className="rounded-full">
                  Max: AED {searchParams.get("max_price")}
                </Badge>
              )}
              {searchParams.get("sort") && searchParams.get("sort") !== "recent" && (
                <Badge variant="secondary" className="rounded-full">
                  {searchParams.get("sort") === "price_asc" 
                    ? "Lowest Price" 
                    : searchParams.get("sort") === "price_desc" 
                      ? "Highest Price" 
                      : "Most Popular"}
                </Badge>
              )}
              {searchParams.get("distance") && searchParams.get("distance") !== "50" && (
                <Badge variant="secondary" className="rounded-full">
                  Within {searchParams.get("distance")} km
                </Badge>
              )}
              {searchParams.get("available") === "true" && (
                <Badge variant="secondary" className="rounded-full">
                  Available only
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Keep only search query, reset all filters including category
                  const newParams = new URLSearchParams();
                  if (query) newParams.set("q", query);
                  window.location.search = newParams.toString();
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {loading || locationLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
            <p className="mt-4 text-muted-foreground">
              {locationLoading ? "Getting your location..." : "Searching for products..."}
            </p>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg border">
                <p className="text-xl font-medium mb-2">No products found</p>
                <p className="text-muted-foreground mb-6">
                  {category 
                    ? `We couldn't find any products matching "${query}" in the "${category}" category` 
                    : `We couldn't find any products matching "${query}"`}
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </>
        )}
        
        {/* Filter sidebar */}
        <FilterSidebar 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)}
          categories={categories}
          totalResults={products.length}
        />
      </main>
    </div>
  );
};

export default SearchPage;
