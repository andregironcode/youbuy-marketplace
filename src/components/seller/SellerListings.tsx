import { useState, useEffect } from "react";
import { ProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

interface SellerListingsProps {
  products?: ProductType[];
  userId?: string;
  limit?: number;
}

export const SellerListings = ({ products: propProducts, userId, limit }: SellerListingsProps) => {
  const [products, setProducts] = useState<ProductType[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
        
        const transformedProducts: ProductType[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: parseFloat(item.price),
          image: item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '/placeholder.svg',
          images: item.image_urls || [],
          location: item.location,
          timeAgo: new Date(item.created_at).toLocaleDateString(),
          status: item.product_status as "available" | "reserved" | "sold",
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[80px] w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleEditProduct = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    navigate(`/profile/edit-product/${productId}`);
  };

  return (
    <div className="space-y-4">
      {products.map(product => (
        <Card 
          key={product.id} 
          className="p-4 relative hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleViewProduct(product.id)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Checkbox 
                id={`select-${product.id}`} 
                aria-label={`Select ${product.title}`} 
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex-shrink-0">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-20 h-20 object-cover rounded"
              />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <div>
                  <div className="text-xl font-bold">€{product.price.toFixed(0)}</div>
                  <h3 className="font-medium">{product.title}</h3>
                </div>
                <div className="text-right space-y-1">
                  <div>Published</div>
                  <div className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</div>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Modified {formatDate(product.createdAt)}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="h-9 bg-youbuy text-white hover:bg-youbuy/90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Feature
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={(e) => handleEditProduct(e, product.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {products.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No products listed yet</p>
        </div>
      )}
    </div>
  );
};
