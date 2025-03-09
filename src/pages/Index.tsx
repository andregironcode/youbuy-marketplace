
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CategoryNav } from "@/components/category/CategoryNav";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingBag, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Show popular categories in the grid (limit to 12 by default, show all when requested)
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 12);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <CategoryNav 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory}
      />
      
      <main className="flex-1 container py-6">
        {selectedCategory === "all" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Popular Categories</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-youbuy"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories ? "Show less" : "View all"} 
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
              {displayedCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button 
                    key={category.id}
                    variant="outline"
                    className="flex flex-col h-24 py-2 justify-center hover:border-youbuy hover:text-youbuy"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-6 w-6 mb-1" />
                    <span className="text-xs text-center line-clamp-2">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategory === "all" ? "Recent Listings" : "Browse Products"}
          </h2>
          <Link to="/sell">
            <Button className="bg-youbuy hover:bg-youbuy-dark">
              <PlusCircle className="mr-2 h-4 w-4" />
              Sell an item
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground mt-2">Try a different category or check back later</p>
          </div>
        )}
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
