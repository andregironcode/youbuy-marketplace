import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { categories } from "@/data/categories";
import { ProductType } from "@/types/product";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { convertToProductType } from "@/types/product";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { FilterToggle } from "@/components/filters/FilterToggle";
import { Badge } from "@/components/ui/badge";
import { countActiveFilters, getUserLocation } from "@/utils/searchUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateDistance } from "@/utils/locationUtils";
import { toast } from "sonner";

const CategoryPage = () => {
  const { categoryId, subcategoryId, subSubcategoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const handleToggleCategories = () => {
      console.log("Toggle categories event received in CategoryPage");
      setShowCategories(prev => !prev);
    };

    window.addEventListener('toggleCategories', handleToggleCategories);
    
    return () => {
      window.removeEventListener('toggleCategories', handleToggleCategories);
    };
  }, []);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

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
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
        const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
        const sortBy = searchParams.get("sort") || "recent";
        const onlyAvailable = searchParams.get("available") === "true";
        const distance = searchParams.get("distance") ? Number(searchParams.get("distance")) : undefined;
        
        let query = supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id(
              id,
              full_name,
              avatar_url
            )
          `);
          
        if (categoryId && categoryId !== "all") {
          query = query.eq('category', categoryId);
          
          if (subcategoryId) {
            query = query.eq('subcategory', subcategoryId);
            
            if (subSubcategoryId) {
              query = query.eq('sub_subcategory', subSubcategoryId);
            }
          }
        }
        
        if (minPrice !== undefined) {
          query = query.gte('price', minPrice);
        }
        
        if (maxPrice !== undefined) {
          query = query.lte('price', maxPrice);
        }
        
        if (onlyAvailable) {
          query = query.eq('product_status', 'available');
        }
        
        switch (sortBy) {
          case "price_asc":
            query = query.order('price', { ascending: true });
            break;
          case "price_desc":
            query = query.order('price', { ascending: false });
            break;
          case "popular":
            query = query.order('like_count', { ascending: false });
            break;
          case "recent":
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }
        
        const { data, error } = await query.limit(50);
        
        if (error) throw error;
        
        if (data) {
          let mappedProducts = data.map(item => convertToProductType(item));
          
          // Filter by distance if user location is available
          if (distance && userLocation && userLocation.lat && userLocation.lng) {
            mappedProducts = mappedProducts.filter(product => {
              if (product.coordinates && product.coordinates.latitude && product.coordinates.longitude) {
                const productDistance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  product.latitude,
                  product.longitude
                );
                return productDistance <= distance;
              }
              return false;
            });
          }
          
          setProducts(mappedProducts);
        }
        
        setActiveFiltersCount(countActiveFilters(searchParams));
      } catch (err) {
        console.error('Error fetching category products:', err);
        toast.error("Error loading products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryId, subcategoryId, subSubcategoryId, searchParams, userLocation]);

  const getCategoryName = () => {
    if (!categoryId || categoryId === "all") return "All Categories";
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return categoryId;
    
    if (subcategoryId) {
      const subcategory = category.subCategories.find(s => s.id === subcategoryId);
      if (!subcategory) return category.name;
      
      if (subSubcategoryId && subcategory.subSubCategories) {
        const subSubcategory = subcategory.subSubCategories.find(ss => ss.id === subSubcategoryId);
        if (subSubcategory) return subSubcategory.name;
      }
      
      return subcategory.name;
    }
    
    return category.name;
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
  };

  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    if (categoryId === "all") {
      navigate("/");
    } else if (subcategoryId) {
      if (subSubcategoryId) {
        navigate(`/category/${categoryId}/${subcategoryId}/${subSubcategoryId}`);
      } else {
        navigate(`/category/${categoryId}/${subcategoryId}`);
      }
    } else {
      navigate(`/category/${categoryId}`);
    }
    
    setShowCategories(false);
  };

  const currentCategory = categories.find(c => c.id === categoryId);
  let currentSubcategory;
  let currentSubSubcategory;
  
  if (currentCategory && subcategoryId) {
    currentSubcategory = currentCategory.subCategories.find(sc => sc.id === subcategoryId);
    
    if (currentSubcategory && subSubcategoryId && currentSubcategory.subSubCategories) {
      currentSubSubcategory = currentSubcategory.subSubCategories.find(ssc => ssc.id === subSubcategoryId);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CategoryBrowser 
        open={showCategories} 
        onOpenChange={setShowCategories} 
        onSelectCategory={handleCategorySelect} 
      />
      
      <main className="flex-1 container py-8">
        <div className="mb-4">
          <Link to="/categories" className="inline-flex items-center text-sm text-muted-foreground hover:text-youbuy mb-2">
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to all categories
          </Link>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{getCategoryName()}</h1>
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'item' : 'items'} available
              </p>
              {searchParams.get("distance") && userLocation && (
                <Badge variant="outline" className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  Within {searchParams.get("distance")} km
                </Badge>
              )}
            </div>
            
            <FilterToggle 
              onClick={() => setIsFilterOpen(true)} 
              activeFiltersCount={activeFiltersCount}
            />
          </div>
          
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
                  const newParams = new URLSearchParams();
                  window.location.search = newParams.toString();
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
        
        {currentCategory && (
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto no-scrollbar">
            {currentCategory.subCategories.slice(0, isMobile ? 3 : 6).map((subcat) => (
              <Button
                key={subcat.id}
                variant={subcategoryId === subcat.id ? "default" : "outline"}
                size="sm"
                onClick={() => navigate(`/category/${categoryId}/${subcat.id}`)}
                className={subcategoryId === subcat.id ? "bg-youbuy hover:bg-youbuy-dark" : ""}
              >
                {subcat.name}
              </Button>
            ))}
            {currentCategory.subCategories.length > (isMobile ? 3 : 6) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategories(true)}
              >
                More...
              </Button>
            )}
          </div>
        )}
        
        {loading || locationLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
            <p className="mt-4 text-muted-foreground">
              {locationLoading ? "Getting your location..." : "Loading products..."}
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
                  We couldn't find any products in this category with the selected filters
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.search = "";
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
        
        <FilterSidebar 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)}
          totalResults={products.length}
        />
      </main>
    </div>
  );
};

export default CategoryPage;
