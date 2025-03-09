
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { products } from "@/data/products";
import { ShoppingBag } from "lucide-react";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ProductSection } from "@/components/product/ProductSection";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/product";
import { toast } from "sonner";

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
  const [userProducts, setUserProducts] = useState<ProductType[]>([]);
  const [isLoadingUserProducts, setIsLoadingUserProducts] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Function to convert Supabase product to ProductType
  const mapToProductType = (product: any): ProductType => {
    const createdAt = new Date(product.created_at);
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    let timeAgo;
    if (diffInDays > 0) {
      timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    // Simplified seller object since we don't have full profile data here
    const seller = {
      id: product.seller_id,
      name: "You", // Since these are the user's own products
      avatar: "https://i.pravatar.cc/150?img=1", // Placeholder
      joinedDate: createdAt.toLocaleDateString(),
      userId: product.seller_id,
      rating: 0,
      totalReviews: 0
    };

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      images: product.image_urls || [],
      location: product.location,
      timeAgo,
      isNew: diffInDays < 3, // Mark as new if less than 3 days old
      isFeatured: product.promotion_level === 'featured',
      createdAt: product.created_at,
      seller,
      category: product.category
    };
  };

  // Fetch user products from Supabase
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!user) return;
      
      setIsLoadingUserProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching user products:', error);
          toast.error('Failed to load your products');
          return;
        }
        
        const mappedProducts = data.map(mapToProductType);
        setUserProducts(mappedProducts);
      } catch (err) {
        console.error('Error in fetchUserProducts:', err);
        toast.error('Something went wrong while loading your products');
      } finally {
        setIsLoadingUserProducts(false);
      }
    };

    fetchUserProducts();
  }, [user]);

  // Get featured products
  const featuredProducts = products.filter(product => product.isFeatured);
  
  // Get recently added products (sorted by creation date)
  const recentlyAddedProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8); 
  
  // For "For You" section - in a real app, this would be personalized
  // Here we're just showing a random selection
  const forYouProducts = [...products]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

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
        
        {/* User's Products Section - Only show if user is logged in and has products */}
        {user && (
          <ProductSection 
            title="My Listings" 
            products={userProducts}
            link="/profile/products"
            linkText="Manage all"
            emptyMessage="You haven't listed any products yet. Start selling now!"
            isLoading={isLoadingUserProducts}
          />
        )}
        
        {/* Featured Products Section */}
        <ProductSection 
          title="Featured Products" 
          products={featuredProducts} 
          link="/featured" 
        />
        
        {/* Recently Added Section */}
        <ProductSection 
          title="Recently Added" 
          products={recentlyAddedProducts} 
          link="/recent" 
        />
        
        {/* For You Section */}
        <ProductSection 
          title="For You" 
          products={forYouProducts} 
          link="/recommended" 
          linkText="See more"
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
