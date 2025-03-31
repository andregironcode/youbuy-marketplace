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
  activeTab?: "selling" | "sold";
  showTabs?: boolean;
  onTabChange?: (tab: "selling" | "sold") => void;
  products?: ProductType[];
  isLoading?: boolean;
}

export const SellerListings = ({ 
  userId, 
  limit = 8, 
  activeTab = "selling",
  showTabs = false,
  onTabChange,
  products: initialProducts = [],
  isLoading: initialLoading = false
}: SellerListingsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState<"selling" | "sold">(activeTab);
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

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const status = currentActiveTab === "selling" ? "available" : "sold";
        
        let query = supabase
          .from('products')
          .select('*, profiles(*)')
          .eq('seller_id', userId)
          .eq('product_status', status);

        // Apply search filter
        if (debouncedSearchTerm) {
          query = query.ilike('title', `%${debouncedSearchTerm}%`);
        }

        query = query.limit(limit);
          
        const { data, error } = await query;
          
        if (error) {
          toast({
            title: "Error",
            description: "Failed to load products. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        const formattedProducts = data.map(item => convertToProductType(item, true));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error in products fetch:", error);
      } finally {
        setIsLoading(false);
        setHasAttemptedFetch(true);
      }
    };

    if (initialProducts.length === 0 && userId && !hasAttemptedFetch) {
      fetchProducts();
    } else if (initialProducts.length > 0 && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      setIsLoading(false);
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

  const handleTabChange = (tab: "selling" | "sold") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
      setHasAttemptedFetch(false);
    }
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
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
