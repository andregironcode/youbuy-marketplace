
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../product/ProductCard";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";
import { Grid2X2, List, ListFilter, Plus, ShoppingBag } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface SellerListingsProps {
  userId?: string;
  limit?: number;
}

export const SellerListings = ({ userId, limit = 8 }: SellerListingsProps) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        console.log("Fetching products for seller ID:", userId);
        
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
  }, [userId, limit]);

  const handleAddProduct = () => {
    navigate('/sell');
  };

  return (
    <div>
      {/* View toggle and action buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('grid')} 
              className={cn(
                "h-9 w-9 p-0 rounded-md", 
                viewMode === 'grid' 
                  ? "bg-white shadow-sm text-youbuy" 
                  : "bg-transparent text-gray-500"
              )}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('list')} 
              className={cn(
                "h-9 w-9 p-0 rounded-md", 
                viewMode === 'list' 
                  ? "bg-white shadow-sm text-youbuy" 
                  : "bg-transparent text-gray-500"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
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
        <Button 
          onClick={handleAddProduct} 
          className="bg-youbuy hover:bg-youbuy-dark text-white shadow-sm"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" /> Upload product
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="rounded-lg bg-youbuy-light border border-youbuy/20 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <ShoppingBag className="h-8 w-8 text-youbuy" />
              </div>
              <h3 className="text-lg font-medium mb-2">You don't have any products yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start selling by uploading your first product. It's quick and easy!
              </p>
              <Button onClick={handleAddProduct} className="bg-youbuy hover:bg-youbuy-dark text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Upload your first product
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              <Card 
                onClick={handleAddProduct}
                className="bg-youbuy-light border border-youbuy/20 rounded-lg flex flex-col items-center justify-center p-6 h-full aspect-square text-youbuy-dark hover:bg-youbuy-muted cursor-pointer transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                  <Plus className="h-6 w-6 text-youbuy" />
                </div>
                <span className="text-center font-medium">Upload product</span>
              </Card>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex gap-4 border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 rounded-md overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{product.title}</h3>
                    <p className="text-youbuy font-bold">AED {product.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{product.timeAgo}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => navigate(`/profile/edit-product/${product.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button 
                onClick={handleAddProduct}
                className="w-full py-6 border-2 border-dashed border-youbuy/30 bg-youbuy-light hover:bg-youbuy-muted text-youbuy-dark font-medium transition-colors"
                variant="ghost"
              >
                <Plus className="mr-2 h-4 w-4" /> Upload product
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
