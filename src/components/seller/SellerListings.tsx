
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductType, convertToProductType } from "@/types/product";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ListFilter, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SellerListingsProps {
  userId?: string;
  limit?: number;
  activeTab?: "selling" | "sold";
  showTabs?: boolean;
  onTabChange?: (tab: "selling" | "sold") => void;
}

export const SellerListings = ({ 
  userId, 
  limit = 8, 
  activeTab = "selling",
  showTabs = false,
  onTabChange
}: SellerListingsProps) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalActiveTab, setInternalActiveTab] = useState<"selling" | "sold">(activeTab);
  const navigate = useNavigate();

  // Use either internal or external tab state
  const currentActiveTab = onTabChange ? activeTab : internalActiveTab;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        console.log("Fetching products for seller ID:", userId);
        
        // Determine the product_status to filter by based on active tab
        const statusFilter = currentActiveTab === "selling" ? "available" : "sold";
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id(
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('seller_id', userId)
          .eq('product_status', statusFilter)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) {
          console.error('Error fetching seller products:', error);
          setLoading(false);
          return;
        }
        
        console.log("Fetched products data:", data);
        
        if (data) {
          const mappedProducts = data.map(item => convertToProductType(item));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error in seller products fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [userId, limit, currentActiveTab]);

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

  return (
    <div>
      {/* Only show header if not controlled by parent */}
      {!onTabChange && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Your products</h2>
          <p className="text-muted-foreground text-sm">
            Here you can list items, manage the ones you already have and activate featured to sell them faster
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

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex gap-4 border rounded-lg p-3 h-24 animate-pulse bg-gray-100"></div>
          ))}
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="rounded-lg bg-youbuy-light border border-youbuy/20 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Plus className="h-8 w-8 text-youbuy" />
              </div>
              <h3 className="text-lg font-medium mb-2">You don't have any {currentActiveTab === "sold" ? "sold" : ""} products yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {currentActiveTab === "selling" 
                  ? "Start selling by uploading your first product. It's quick and easy!" 
                  : "Products you've sold will appear here."}
              </p>
              {currentActiveTab === "selling" && (
                <Button onClick={handleAddProduct} className="bg-youbuy hover:bg-youbuy-dark text-white shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Upload your first product
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                  </div>
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
                        <p className="text-youbuy font-bold">AED {product.price.toFixed(2)}</p>
                        <h3 className="font-medium text-sm">{product.title}</h3>
                      </div>
                      <div className="mt-2 sm:mt-0 text-xs text-muted-foreground grid grid-cols-2 gap-x-4">
                        <div>
                          <p>Published</p>
                          <p>{formatDate(product.createdAt)}</p>
                        </div>
                        <div>
                          <p>Modified</p>
                          <p>{product.updatedAt ? formatDate(product.updatedAt) : "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-white bg-youbuy hover:bg-youbuy-dark"
                    >
                      Feature
                    </Button>
                  </div>
                </div>
              ))}
              {currentActiveTab === "selling" && (
                <Button 
                  onClick={handleAddProduct}
                  className="w-full py-6 border-2 border-dashed border-youbuy/30 bg-youbuy-light hover:bg-youbuy-muted text-youbuy-dark font-medium transition-colors"
                  variant="ghost"
                >
                  <Plus className="mr-2 h-4 w-4" /> Upload product
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
