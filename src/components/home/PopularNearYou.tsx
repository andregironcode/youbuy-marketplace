
import { useState, useEffect } from "react";
import { ProductSection } from "@/components/product/ProductSection";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";

export const PopularNearYou = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location from localStorage or use a default
    const location = localStorage.getItem('userLocation') || 'Dubai';
    setUserLocation(location);
    
    const fetchNearbyProducts = async () => {
      setLoading(true);
      
      try {
        // In a real app, we would use the user's actual location and fetch based on distance
        // For now, we're just simulating with a limit and order
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
          .order('view_count', { ascending: false }) // Most viewed items
          .limit(10);
          
        if (error) {
          console.error('Error fetching nearby products:', error);
          setLoading(false);
          return;
        }
        
        if (data) {
          const mappedProducts = data.map(item => convertToProductType(item));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error in nearby products fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNearbyProducts();
  }, []);

  return (
    <ProductSection
      title={`Popular Near ${userLocation || 'You'}`}
      products={products}
      link="/search?sort=nearby"
      linkText="View all nearby items"
      isLoading={loading}
      emptyMessage="No popular items found nearby"
    />
  );
};
