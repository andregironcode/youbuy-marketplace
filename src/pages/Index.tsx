
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingBag, ChevronRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCategoryDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>{selectedCategory === "all" ? "All Categories" : "Filter by Category"}</span>
            </Button>
            {selectedCategory !== "all" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCategory("all")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear filter
              </Button>
            )}
          </div>
          <Link to="/sell">
            <Button className="bg-youbuy hover:bg-youbuy-dark">
              <PlusCircle className="mr-2 h-4 w-4" />
              Sell an item
            </Button>
          </Link>
        </div>
        
        <CategoryBrowser 
          open={categoryDialogOpen} 
          onOpenChange={setCategoryDialogOpen} 
          onSelectCategory={handleCategorySelect} 
        />
        
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
