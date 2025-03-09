
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ShoppingBag } from "lucide-react";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ProductSection } from "@/components/product/ProductSection";
import { ProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";

// Add CSS to hide scrollbars for the carousel
const scrollbarHideStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

const Index = () => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductType[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Get all products
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id (
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Format the products
        const formattedProducts: ProductType[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: parseFloat(item.price),
          image: item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '/placeholder.svg',
          images: item.image_urls || [],
          location: item.location,
          timeAgo: new Date(item.created_at).toLocaleDateString(),
          createdAt: item.created_at,
          category: item.category,
          subcategory: item.subcategory,
          viewCount: item.view_count || 0,
          likeCount: item.like_count || 0,
          seller: {
            id: item.seller_id,
            name: item.profiles?.full_name || "Unknown User",
            avatar: item.profiles?.avatar_url || "/placeholder.svg",
            joinedDate: new Date().toLocaleDateString(),
          }
        }));

        // Filter for featured (for now, those with highest like_count)
        const featured = [...formattedProducts]
          .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          .slice(0, 8);
        setFeaturedProducts(featured);

        // Recent products (already sorted by created_at in the query)
        setRecentProducts(formattedProducts.slice(0, 8));

        // Recommended/For You (for now, random selection)
        const shuffled = [...formattedProducts].sort(() => 0.5 - Math.random());
        setRecommendedProducts(shuffled.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryClick = () => {
    setCategoryDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add the scrollbar hiding styles */}
      <style>{scrollbarHideStyles}</style>
      
      <Navbar onCategoryClick={handleCategoryClick} />
      
      <main className="flex-1 container py-6">
        <CategoryBrowser 
          open={categoryDialogOpen} 
          onOpenChange={setCategoryDialogOpen} 
          onSelectCategory={(categoryId, subcategoryId, subSubcategoryId) => {
            // Build the appropriate URL based on the selected category hierarchy
            let url = `/category/${categoryId}`;
            if (subcategoryId) {
              url += `/${subcategoryId}`;
              if (subSubcategoryId) {
                url += `/${subSubcategoryId}`;
              }
            }
            // Use navigate instead of window.location for React Router
            navigate(url);
          }} 
        />
        
        {/* Featured Products Section */}
        <ProductSection 
          title="Featured Products" 
          products={featuredProducts} 
          link="/featured"
          isLoading={loading}
        />
        
        {/* Recently Added Section */}
        <ProductSection 
          title="Recently Added" 
          products={recentProducts} 
          link="/recent"
          isLoading={loading}
        />
        
        {/* For You Section */}
        <ProductSection 
          title="For You" 
          products={recommendedProducts} 
          link="/recommended" 
          linkText="See more"
          isLoading={loading}
        />
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-youbuy" />
              <span className="font-bold">YouBuy</span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              © 2023 YouBuy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
