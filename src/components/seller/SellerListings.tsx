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
        
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(*)')
          .eq('seller_id', userId)
          .eq('product_status', status)
          .order('created_at', { ascending: false })
          .limit(limit);
          
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
  }, [userId, currentActiveTab, limit, toast, initialProducts, hasAttemptedFetch]);

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
    <div>
      {!onTabChange && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Products</h2>
          <p className="text-muted-foreground text-sm">
            View this seller's available products
          </p>
        </div>
      )}

      {showTabs && (
        <ListingsTabs 
          currentActiveTab={currentActiveTab} 
          onTabChange={handleTabChange} 
        />
      )}

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
            <div className="space-y-3">
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
