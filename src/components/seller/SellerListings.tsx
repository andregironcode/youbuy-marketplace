import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ListingsLoader } from "./ListingsLoader";
import { EmptyListings } from "./EmptyListings";
import { ListingItem } from "./ListingItem";
import { ListingsTabs } from "./ListingsTabs";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { Button } from "@/components/ui/button";

interface SellerListingsProps {
  userId?: string;
  limit?: number;
  activeTab?: "active" | "reserved" | "sold";
  showTabs?: boolean;
  onTabChange?: (tab: "active" | "reserved" | "sold") => void;
  products?: ProductType[];
  isLoading?: boolean;
}

export const SellerListings = ({ 
  userId, 
  limit = 8, 
  activeTab = "active",
  showTabs = false,
  onTabChange,
  products: initialProducts = [],
  isLoading: initialLoading = false
}: SellerListingsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState<"active" | "reserved" | "sold">(activeTab);
  const [products, setProducts] = useState<ProductType[]>(initialProducts);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;
  const isOwnListings = user?.id === userId;

  const fetchProducts = async () => {
    if (!userId) {
      console.log("Cannot fetch products: userId is undefined or null");
      return;
    }
    
    console.log("Fetching products for user ID:", userId);
    console.log("Current tab:", currentActiveTab);
    
    setIsLoading(true);
    try {
      let status;
      switch (currentActiveTab) {
        case "active":
          status = "available";
          break;
        case "reserved":
          status = "reserved";
          break;
        case "sold":
          status = "sold";
          break;
        default:
          status = "available";
      }
      console.log("Filtering by product status:", status);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles!seller_id(*),
          reserved_users:profiles(*)
        `)
        .eq('seller_id', userId)
        .eq('product_status', status);

      // If in reserved tab, join with the profiles table to get reservation info
      if (status === 'reserved') {
        // We need to handle this in the formatter by looking for reserved_user_id
        console.log("Fetching reserved products");
      }

      // Apply search filter
      if (debouncedSearchTerm) {
        console.log("Applying search filter:", debouncedSearchTerm);
        query = query.ilike('title', `%${debouncedSearchTerm}%`);
      }

      query = query.limit(limit);
      console.log("Query limit:", limit);
        
      const { data, error } = await query;
        
      if (error) {
        console.error("Supabase query error:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Query results:", data);
      console.log("Number of products found:", data?.length || 0);
      
      const formattedProducts = data.map(item => {
        const product = convertToProductType(item, true);
        
        // Add reserved user information by fetching the data in a more reliable way
        if (item.product_status === 'reserved' && item.reserved_user_id) {
          // If we have the reserved_user_id, we need to find that user's info
          // from all profiles that were returned with the query
          const reservedUserProfile = data.find(p => 
            p.profiles && p.profiles.id === item.reserved_user_id
          )?.profiles;
          
          if (reservedUserProfile) {
            product.reservedFor = reservedUserProfile.full_name || 'Unknown User';
            product.reservedUserId = item.reserved_user_id;
          } else {
            product.reservedFor = 'Reserved';
            product.reservedUserId = item.reserved_user_id;
          }
        }
        
        console.log("Converted product:", product.id, product.title);
        return product;
      });
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error in products fetch:", error);
    } finally {
      setIsLoading(false);
      setHasAttemptedFetch(true);
    }
  };

  useEffect(() => {
    if (initialProducts.length === 0 && userId && !hasAttemptedFetch) {
      console.log("No initial products, fetching from database...");
      fetchProducts();
    } else if (initialProducts.length > 0 && !hasAttemptedFetch) {
      console.log("Using initial products:", initialProducts.length);
      setHasAttemptedFetch(true);
      setIsLoading(false);
    } else {
      console.log("Products fetch conditions not met:", {
        initialProductsLength: initialProducts.length,
        userId: !!userId,
        hasAttemptedFetch
      });
    }
  }, [userId, currentActiveTab, limit, toast, initialProducts, hasAttemptedFetch, debouncedSearchTerm]);

  useEffect(() => {
    if (onTabChange) {
      setHasAttemptedFetch(false);
    }
  }, [activeTab, onTabChange]);

  const handleAddProduct = () => {
    navigate('/sell');
  };

  const handleTabChange = (tab: "active" | "reserved" | "sold") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
      setHasAttemptedFetch(false);
    }
  };

  const handleProductUpdated = () => {
    console.log("Product updated, refreshing listings...");
    setHasAttemptedFetch(false);
    fetchProducts();
  };

  const displayProducts = initialProducts.length > 0 ? initialProducts.slice(0, limit) : products.slice(0, limit);

  return (
    <div className="space-y-4 -ml-6">
      {!onTabChange && (
        <div className="flex flex-col space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            View this seller's available products
          </p>
        </div>
      )}

      {showTabs && (
        <div className="border-b">
          <ListingsTabs 
            currentActiveTab={currentActiveTab} 
            onTabChange={handleTabChange} 
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        totalResults={products.length}
      />

      {isLoading ? (
        <ListingsLoader />
      ) : (
        <>
          {displayProducts.length === 0 ? (
            <EmptyListings 
              activeTab={currentActiveTab} 
              onAddProduct={handleAddProduct} 
            />
          ) : (
            <div className="grid gap-3">
              {displayProducts.map((product) => (
                <ListingItem 
                  key={product.id} 
                  product={product} 
                  showBuyButtons={!isOwnListings}
                  onProductUpdated={handleProductUpdated}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
