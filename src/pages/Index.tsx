import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { ModernHome } from "@/components/home/ModernHome";

const Index = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch recently added products
        const { data: recentData, error: recentError } = await supabase
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
          .limit(8);

        if (recentError) throw recentError;

        // Fetch trending products (most liked in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: trendingData, error: trendingError } = await supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id(
              id,
              full_name,
              avatar_url
            )
          `)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('like_count', { ascending: false })
          .limit(8);

        if (trendingError) throw trendingError;

        setProducts(recentData.map(item => convertToProductType(item)));
        setTrendingProducts(trendingData.map(item => convertToProductType(item)));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ModernHome 
      products={products}
      trendingProducts={trendingProducts}
      isLoading={loading}
    />
  );
};

export default Index;
