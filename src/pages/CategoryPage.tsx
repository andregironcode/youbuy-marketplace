import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { ShoppingBag, ChevronRight, SlidersHorizontal, Check } from "lucide-react";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Find all subcategories and sub-subcategories for a given category
const findAllSubcategories = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return [];
  
  let result: string[] = [categoryId];
  
  // Add all subcategories
  category.subCategories.forEach(subcat => {
    result.push(subcat.id);
    
    // Add all sub-subcategories if they exist
    if (subcat.subSubCategories) {
      subcat.subSubCategories.forEach(subsubcat => {
        result.push(subsubcat.id);
      });
    }
  });
  
  return result;
};

// Find the path to a specific subcategory or sub-subcategory
const findCategoryPath = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return null;
  
  if (!subcategoryId) {
    return { 
      category: { id: category.id, name: category.name },
      subcategory: null,
      subSubcategory: null
    };
  }
  
  const subcategory = category.subCategories.find(sub => sub.id === subcategoryId);
  if (!subcategory) return null;
  
  if (!subSubcategoryId) {
    return {
      category: { id: category.id, name: category.name },
      subcategory: { id: subcategory.id, name: subcategory.name },
      subSubcategory: null
    };
  }
  
  const subSubcategory = subcategory.subSubCategories?.find(sub => sub.id === subSubcategoryId);
  if (!subSubcategory) return null;
  
  return {
    category: { id: category.id, name: category.name },
    subcategory: { id: subcategory.id, name: subcategory.name },
    subSubcategory: { id: subSubcategory.id, name: subSubcategory.name }
  };
};

const timeFrames = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "all", label: "All time" }
];

const conditions = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" }
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" }
];

const CategoryPage = () => {
  const { categoryId = "all", subcategoryId, subSubcategoryId } = useParams();
  const navigate = useNavigate();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [location, setLocation] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [timeFrame, setTimeFrame] = useState("all");
  const [condition, setCondition] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryId);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(subSubcategoryId);
  
  // Determine which categories we should filter by
  useEffect(() => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    setSelectedSubSubcategory(subSubcategoryId);
  }, [categoryId, subcategoryId, subSubcategoryId]);
  
  // Find category information for breadcrumbs and title
  const categoryPath = categoryId !== "all" 
    ? findCategoryPath(categoryId, subcategoryId, subSubcategoryId)
    : null;
  
  // Filter products based on selected categories and other filters
  const filteredProducts = products.filter(product => {
    // Category filter
    if (categoryId !== "all") {
      // If we have a sub-subcategory selected
      if (subSubcategoryId) {
        if (product.category !== subSubcategoryId) {
          return false;
        }
      }
      // If we have a subcategory selected
      else if (subcategoryId) {
        // Get all sub-subcategories for this subcategory
        const subcategory = categories
          .find(cat => cat.id === categoryId)
          ?.subCategories.find(sub => sub.id === subcategoryId);
        
        const validCategories = subcategory?.subSubCategories 
          ? [subcategoryId, ...subcategory.subSubCategories.map(s => s.id)]
          : [subcategoryId];
        
        if (!validCategories.includes(product.category)) {
          return false;
        }
      }
      // If we just have a main category selected
      else {
        const validCategories = findAllSubcategories(categoryId);
        if (!validCategories.includes(product.category)) {
          return false;
        }
      }
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
    
    // Time frame filter
    if (timeFrame !== "all") {
      const days = parseInt(timeFrame);
      const productDate = new Date(product.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - productDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > days) {
        return false;
      }
    }
    
    // Condition filter
    if (condition.length > 0) {
      // Simulate condition - in a real app, products would have this field
      const productCondition = product.isNew ? "new" : "good";
      if (!condition.includes(productCondition)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "price-low") {
      return a.price - b.price;
    } else if (sortBy === "price-high") {
      return b.price - a.price;
    }
    return 0;
  });

  const handleCategoryClick = () => {
    setCategoryDialogOpen(true);
  };

  const handleCategorySelect = (newCategoryId: string, newSubcategoryId?: string, newSubSubcategoryId?: string) => {
    let url = `/category/${newCategoryId}`;
    if (newSubcategoryId) {
      url += `/${newSubcategoryId}`;
      if (newSubSubcategoryId) {
        url += `/${newSubSubcategoryId}`;
      }
    }
    navigate(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceMin("");
    setPriceMax("");
    setLocation("");
    setTimeFrame("all");
    setCondition([]);
    setSortBy("newest");
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handleConditionChange = (value: string) => {
    setCondition(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  
  // Get the title for the current category/subcategory/sub-subcategory
  const getCategoryTitle = () => {
    if (categoryId === "all") return "All Categories";
    
    if (categoryPath) {
      if (categoryPath.subSubcategory) {
        return categoryPath.subSubcategory.name;
      } else if (categoryPath.subcategory) {
        return categoryPath.subcategory.name;
      } else if (categoryPath.category) {
        return categoryPath.category.name;
      }
    }
    
    return categoryId;
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
        <div className="flex items-center text-sm mb-4 overflow-x-auto pb-2">
          <Link to="/" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground flex-shrink-0" />
          
          {categoryId === "all" ? (
            <span className="font-medium whitespace-nowrap">All Categories</span>
          ) : categoryPath ? (
            <>
              <Link to="/category/all" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                All Categories
              </Link>
              <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground flex-shrink-0" />
              
              <Link 
                to={`/category/${categoryPath.category.id}`} 
                className={`${!categoryPath.subcategory ? 'font-medium' : 'text-muted-foreground hover:text-foreground'} whitespace-nowrap`}
              >
                {categoryPath.category.name}
              </Link>
              
              {categoryPath.subcategory && (
                <>
                  <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground flex-shrink-0" />
                  <Link 
                    to={`/category/${categoryPath.category.id}/${categoryPath.subcategory.id}`} 
                    className={`${!categoryPath.subSubcategory ? 'font-medium' : 'text-muted-foreground hover:text-foreground'} whitespace-nowrap`}
                  >
                    {categoryPath.subcategory.name}
                  </Link>
                </>
              )}
              
              {categoryPath.subSubcategory && (
                <>
                  <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{categoryPath.subSubcategory.name}</span>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/category/all" className="text-muted-foreground hover:text-foreground whitespace-nowrap">
                All Categories
              </Link>
              <ChevronRight className="h-3 w-3 mx-2 text-muted-foreground flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">{categoryId}</span>
            </>
          )}
        </div>
        
        {/* Category header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {getCategoryTitle()}
          </h1>
          <p className="text-muted-foreground">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
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
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
            <div className="p-4 border rounded-md bg-background shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Price Range */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Price Range</h4>
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
                
                {/* Location */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Location</h4>
                  <Input 
                    type="text" 
                    placeholder="Enter location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                {/* Time Frame */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Date Posted</h4>
                  <RadioGroup value={timeFrame} onValueChange={setTimeFrame}>
                    {timeFrames.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                        <Label htmlFor={`time-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Condition */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Condition</h4>
                  <div className="space-y-2">
                    {conditions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`condition-${option.value}`} 
                          checked={condition.includes(option.value)}
                          onCheckedChange={() => handleConditionChange(option.value)}
                        />
                        <label
                          htmlFor={`condition-${option.value}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={toggleFilters}
                  className="bg-youbuy hover:bg-youbuy-dark"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Applied filters */}
        {(searchTerm || priceMin || priceMax || location || timeFrame !== "all" || condition.length > 0) && (
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
            {timeFrame !== "all" && (
              <Badge variant="outline" className="flex items-center">
                Date: {timeFrames.find(t => t.value === timeFrame)?.label}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-1" 
                  onClick={() => setTimeFrame("all")}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></svg>
                </button>
              </Badge>
            )}
            {condition.length > 0 && (
              <Badge variant="outline" className="flex items-center">
                Condition: {condition.map(c => conditions.find(o => o.value === c)?.label).join(", ")}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-1" 
                  onClick={() => setCondition([])}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></svg>
                </button>
              </Badge>
            )}
          </div>
        )}
        
        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {sortedProducts.length === 0 && (
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
