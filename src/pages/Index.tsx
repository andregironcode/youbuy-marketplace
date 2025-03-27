
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
        console.log("Fetching products for homepage...");
        
        // Fetch regular products
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
          console.log(`Fetched ${data.length} products`);
          const mappedProducts = data.map(item => convertToProductType(item));
          setProducts(mappedProducts);
        }

        // Fetch trending products (most liked)
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
          .order('like_count', { ascending: false })
          .limit(12);
          
        if (trendingError) {
          console.error('Error fetching trending products:', trendingError);
        } else if (trendingData) {
          console.log(`Fetched ${trendingData.length} trending products`);
          const mappedTrending = trendingData.map(item => convertToProductType(item));
          setTrendingProducts(mappedTrending);
        }
      } catch (err) {
        console.error('Error in products fetch:', err);
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

  // Helper function to check if any content is available
  const hasContent = !loading && (products.length > 0 || trendingProducts.length > 0);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Debug info - will be removed in production */}
      {!hasContent && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded m-4">
          <p className="font-bold">Debug Info</p>
          <p>No products found to display. This may be because:</p>
          <ul className="list-disc ml-5">
            <li>The database hasn't been seeded with initial data</li>
            <li>There's an issue connecting to the database</li>
            <li>The query is not returning the expected results</li>
          </ul>
        </div>
      )}
      
      <main className="flex-1">
        {/* CategoryBrowser component */}
        <CategoryBrowser 
          open={showCategories} 
          onOpenChange={setShowCategories} 
          onSelectCategory={handleCategorySelect} 
        />
        
        {/* Hero Banner */}
        <HomeBanner />
        
        <div className="container py-8">
          {/* Category Cards */}
          <CategoryCards />
          
          {/* Trending Products */}
          <TrendingProducts products={trendingProducts} isLoading={loading} />
          
          {/* Popular Near You */}
          <PopularNearYou />
          
          {/* Recently Added Products */}
          <ProductSection
            title="Recently Added"
            products={products}
            link="/search?sort=newest"
            linkText="View all new items"
            isLoading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
