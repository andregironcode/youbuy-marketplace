
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductType } from "@/types/product";
import { Button } from "../ui/button";
import { ListFilter, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  products = [],
  isLoading = false
}: SellerListingsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState<"selling" | "sold">(activeTab);
  const navigate = useNavigate();

  // Use either internal or external tab state
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;

  const handleAddProduct = () => {
    navigate('/sell');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/profile/edit-product/${productId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  const handleTabChange = (tab: "selling" | "sold") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Use passed products if available, otherwise use empty array
  const displayProducts = products.slice(0, limit);

  return (
    <div>
      {/* Only show header if not controlled by parent */}
      {!onTabChange && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Products</h2>
          <p className="text-muted-foreground text-sm">
            View this seller's available products
          </p>
        </div>
      )}

      {/* Tab navigation and filter - only show if showTabs is true */}
      {showTabs && (
        <div className="flex justify-between items-center mb-4 border-b">
          <div className="flex">
            <button
              onClick={() => handleTabChange("selling")}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors relative",
                currentActiveTab === "selling"
                  ? "text-youbuy border-b-2 border-youbuy"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              SELLING
            </button>
            <button
              onClick={() => handleTabChange("sold")}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors relative",
                currentActiveTab === "sold"
                  ? "text-youbuy border-b-2 border-youbuy"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              SOLD
            </button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-600 gap-2"
          >
            <ListFilter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex gap-4 border rounded-lg p-3 h-24 animate-pulse bg-gray-100"></div>
          ))}
        </div>
      ) : (
        <>
          {displayProducts.length === 0 ? (
            <div className="rounded-lg bg-youbuy-light border border-youbuy/20 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Plus className="h-8 w-8 text-youbuy" />
              </div>
              <h3 className="text-lg font-medium mb-2">No {currentActiveTab === "sold" ? "sold" : ""} products found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {currentActiveTab === "selling" 
                  ? "This seller doesn't have any products listed at the moment." 
                  : "This seller doesn't have any sold products yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-youbuy font-bold">€{product.price.toFixed(2)}</p>
                        <h3 className="font-medium text-sm">{product.title}</h3>
                      </div>
                      <div className="mt-2 sm:mt-0 text-xs text-muted-foreground">
                        <p>Listed {product.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
