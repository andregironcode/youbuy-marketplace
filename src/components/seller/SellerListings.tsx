
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../product/ProductCard";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";

interface SellerListingsProps {
  userId?: string;
  limit?: number;
}

export const SellerListings = ({ userId, limit = 8 }: SellerListingsProps) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
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
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No listings yet</p>
              <Button onClick={handleAddProduct} className="bg-youbuy hover:bg-youbuy-dark">
                Sell an item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              <Button 
                onClick={handleAddProduct}
                className="bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 h-full aspect-square text-gray-500 hover:bg-gray-50"
              >
                <span className="text-3xl mb-2">+</span>
                <span>Sell an item</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
