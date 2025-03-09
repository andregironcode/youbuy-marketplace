
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { products } from "@/data/products";
import { ShoppingBag } from "lucide-react";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ProductSection } from "@/components/product/ProductSection";

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

  // Get featured products
  const featuredProducts = products.filter(product => product.isFeatured);
  
  // Get recently added products (sorted by creation date)
  const recentlyAddedProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8); // Increased from 4 to 8 for better carousel
  
  // For "For You" section - in a real app, this would be personalized
  // Here we're just showing a random selection
  const forYouProducts = [...products]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8); // Increased from 4 to 8 for better carousel

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
