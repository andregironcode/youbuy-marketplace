
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { ProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";

const Index = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
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
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        const mappedProducts: ProductType[] = data.map(item => {
          // Extract profiles data safely (checking if it exists and is an object)
          const profileData = item.profiles && typeof item.profiles === 'object' ? item.profiles : null;
          
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            price: parseFloat(item.price),
            image: item.image_urls?.[0] || '/placeholder.svg',
            images: item.image_urls || [],
            location: item.location,
            timeAgo: formatDistance(new Date(item.created_at), new Date(), { addSuffix: true }),
            seller: {
              id: item.seller_id,
              name: profileData?.full_name || 'Unknown Seller',
              avatar: profileData?.avatar_url || '/placeholder.svg',
              joinedDate: item.created_at
            },
            category: item.category,
            subcategory: item.subcategory || undefined,
            subSubcategory: item.sub_subcategory || undefined,
            viewCount: item.view_count || 0,
            likeCount: item.like_count || 0,
            createdAt: item.created_at
          };
        });
        
        setProducts(mappedProducts);
      }
      
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Discover amazing deals nearby</h1>
          <p className="text-muted-foreground">Find items you'll love at prices you'll love even more</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
            ))}
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
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
