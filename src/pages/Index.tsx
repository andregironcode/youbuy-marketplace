import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { useNavigate } from "react-router-dom";
import { ProductSection } from "@/components/product/ProductSection";
import { HomeBanner } from "@/components/home/HomeBanner";
import { CategoryCards } from "@/components/home/CategoryCards";
import { PopularNearYou } from "@/components/home/PopularNearYou";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { SparklesHome } from "@/components/home/SparklesHome";

const Index = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleToggleCategories = () => {
      console.log("Toggle categories event received in Index");
      setShowCategories(prev => !prev);
    };

    window.addEventListener('toggleCategories', handleToggleCategories);
    
    return () => {
      window.removeEventListener('toggleCategories', handleToggleCategories);
    };
  }, []);

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

  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    console.log("Selected category:", categoryId, subcategoryId, subSubcategoryId);
    
    if (categoryId === "all") {
      navigate("/");
    } else if (subSubcategoryId) {
      navigate(`/category/${categoryId}/${subcategoryId}/${subSubcategoryId}`);
    } else if (subcategoryId) {
      navigate(`/category/${categoryId}/${subcategoryId}`);
    } else {
      navigate(`/category/${categoryId}`);
    }
    
    setShowCategories(false);
  };

  // Use the new SparklesHome component
  return (
    <SparklesHome 
      products={products}
      trendingProducts={trendingProducts}
      isLoading={loading}
    />
  );

  /* Original implementation (commented out)
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <CategoryBrowser 
          open={showCategories} 
          onOpenChange={setShowCategories} 
          onSelectCategory={handleCategorySelect} 
        />
        
        <HomeBanner />
        
        <div className="container py-8">
          <CategoryCards />
          
          <TrendingProducts products={trendingProducts} isLoading={loading} />
          
          <PopularNearYou />
          
          <ProductSection
            title="Recently Added"
            products={products}
            link="/search?sort=newest&time=24h"
            linkText="View all new items"
            isLoading={loading}
          />
        </div>
      </main>
    </div>
  );
  */
};

export default Index;
