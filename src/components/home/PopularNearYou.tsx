
import { useState, useEffect } from "react";
import { ProductSection } from "@/components/product/ProductSection";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";

export const PopularNearYou = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location from localStorage or use a default
    const location = localStorage.getItem('userLocation') || 'Dubai';
    setUserLocation(location);
    
    const fetchNearbyProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, we would use the user's actual location and fetch based on distance
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
          setError('Failed to load popular products. Please try again.');
          setLoading(false);
          return;
        }
        
        if (data) {
          const mappedProducts = data.map(item => convertToProductType(item));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error in nearby products fetch:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNearbyProducts();
  }, []);

  return (
    <>
      {error && (
        <div className="text-red-500 text-center mb-4 p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <ProductSection
        title={`Popular Near ${userLocation || 'You'}`}
        products={products}
        link="/search?sort=nearby"
        linkText="View all nearby items"
        isLoading={loading}
        emptyMessage="No popular items found nearby"
      />
    </>
  );
};
