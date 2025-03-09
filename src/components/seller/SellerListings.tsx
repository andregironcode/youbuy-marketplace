
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface SellerListingsProps {
  products?: ProductType[];
  userId?: string;
  limit?: number;
}

export const SellerListings = ({ products: propProducts, userId, limit }: SellerListingsProps) => {
  const [products, setProducts] = useState<ProductType[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const { user } = useAuth();
  
  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      return;
    }
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const sellerId = userId || user?.id;
        
        if (!sellerId) {
          setLoading(false);
          return;
        }
        
        let query = supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });
          
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        // Transform database products to match ProductType
        const transformedProducts: ProductType[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: parseFloat(item.price),
          image: item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '/placeholder.svg',
          images: item.image_urls || [],
          location: item.location,
          timeAgo: new Date(item.created_at).toLocaleDateString(),
          status: item.product_status,
          createdAt: item.created_at,
          category: item.category,
          subcategory: item.subcategory,
          seller: {
            id: item.seller_id,
            name: "You",
            avatar: "/placeholder.svg",
            joinedDate: new Date().toLocaleDateString(),
          }
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error in products fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [propProducts, userId, user, limit]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      
      {products.length === 0 && (
        <div className="col-span-full py-10 text-center">
          <p className="text-muted-foreground">No products listed yet</p>
        </div>
      )}
    </div>
  );
};
