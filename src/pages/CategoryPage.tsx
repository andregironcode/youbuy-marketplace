
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { ShoppingBag, ChevronRight, SlidersHorizontal } from "lucide-react";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/data/categories";
import { Badge } from "@/components/ui/badge";

const CategoryPage = () => {
  const { categoryId = "all" } = useParams();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [location, setLocation] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Find current category details
  const currentCategory = categories.find(cat => cat.id === categoryId);
  
  // Filter products based on selected category and other filters
  const filteredProducts = products.filter(product => {
    // Category filter
    if (categoryId !== "all" && product.category !== categoryId) {
      return false;
    }
    
    // Search term filter
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Price range filter
    if (priceMin && product.price < Number(priceMin)) {
      return false;
    }
    if (priceMax && product.price > Number(priceMax)) {
      return false;
    }
    
    // Location filter
    if (location && !product.location.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleCategoryClick = () => {
    setCategoryDialogOpen(true);
  };

  const handleCategorySelect = (newCategoryId: string) => {
    window.location.href = `/category/${newCategoryId}`;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceMin("");
    setPriceMax("");
    setLocation("");
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onCategoryClick={handleCategoryClick} />
      
      <main className="flex-1 container py-6">
        <CategoryBrowser 
          open={categoryDialogOpen} 
          onOpenChange={setCategoryDialogOpen} 
          onSelectCategory={handleCategorySelect} 
        />
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm mb-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground" />
          {categoryId !== "all" ? (
            <>
              <Link to="/category/all" className="text-muted-foreground hover:text-foreground">
                All Categories
              </Link>
              <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground" />
              <span className="font-medium">{currentCategory?.name || categoryId}</span>
            </>
          ) : (
            <span className="font-medium">All Categories</span>
          )}
        </div>
        
        {/* Category header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {categoryId !== "all" ? currentCategory?.name || categoryId : "All Categories"}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} items
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Search in this category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-2"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFilters}
              className={filtersVisible ? "bg-accent" : ""}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Expanded filters */}
          {filtersVisible && (
            <div className="p-4 border rounded-md bg-background">
              <h3 className="font-medium mb-3">Filters</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <span>-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    type="text" 
                    placeholder="Enter location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="mr-2"
                >
                  Clear
                </Button>
                <Button 
                  size="sm"
                  className="bg-youbuy hover:bg-youbuy-dark"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Applied filters */}
        {(searchTerm || priceMin || priceMax || location) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge variant="outline" className="flex items-center">
                Search: {searchTerm}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-1" 
                  onClick={() => setSearchTerm("")}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </Badge>
            )}
            {(priceMin || priceMax) && (
              <Badge variant="outline" className="flex items-center">
                Price: {priceMin || '0'} - {priceMax || '∞'}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-1" 
                  onClick={() => { setPriceMin(""); setPriceMax(""); }}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </Badge>
            )}
            {location && (
              <Badge variant="outline" className="flex items-center">
                Location: {location}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-1" 
                  onClick={() => setLocation("")}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </Badge>
            )}
          </div>
        )}
        
        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground mt-2">Try different filters or check back later</p>
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

export default CategoryPage;
