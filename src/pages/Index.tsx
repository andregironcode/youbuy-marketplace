
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { products } from "@/data/products";
import { ShoppingBag } from "lucide-react";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { ProductSection } from "@/components/product/ProductSection";

const Index = () => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Get featured products
  const featuredProducts = products.filter(product => product.isFeatured);
  
  // Get recently added products (sorted by creation date)
  const recentlyAddedProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  
  // For "For You" section - in a real app, this would be personalized
  // Here we're just showing a random selection
  const forYouProducts = [...products]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const handleCategoryClick = () => {
    setCategoryDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onCategoryClick={handleCategoryClick} />
      
      <main className="flex-1 container py-6">
        <CategoryBrowser 
          open={categoryDialogOpen} 
          onOpenChange={setCategoryDialogOpen} 
          onSelectCategory={(categoryId) => {
            // We'll need to create a category page to handle this
            console.log(`Selected category: ${categoryId}`);
            window.location.href = `/category/${categoryId}`;
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
