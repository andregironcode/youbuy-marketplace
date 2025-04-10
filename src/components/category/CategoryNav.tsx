
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { categoryNav } from "@/data/categories";
import { Filter, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryDropdown } from "./CategoryDropdown";

interface CategoryNavProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const CategoryNav = ({ selectedCategory, setSelectedCategory }: CategoryNavProps) => {
  const isMobile = useIsMobile();
  const [showGrid, setShowGrid] = useState(false);
  const navigate = useNavigate();
  
  // Only show main categories in the top navigation bar (limited number)
  const mainCategories = categoryNav.slice(0, isMobile ? 3 : 6);
  
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      navigate("/");
    } else {
      navigate(`/category/${categoryId}`);
    }
  };
  
  return (
    <div className="border-b bg-white">
      <div className="container py-4">
        <div className="flex flex-wrap items-center gap-2 max-w-full overflow-hidden">
          <Button
            key="all"
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className={selectedCategory === "all" ? "bg-youbuy hover:bg-youbuy-dark" : "hover:bg-youbuy/10 hover:text-youbuy"}
            onClick={() => handleCategoryClick("all")}
          >
            All Categories
          </Button>
          
          {!isMobile && <CategoryDropdown />}
          
          {mainCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.id ? "bg-youbuy hover:bg-youbuy-dark" : "hover:bg-youbuy/10 hover:text-youbuy"}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="border-youbuy/20 hover:bg-youbuy/10 hover:text-youbuy"
          >
            {showGrid ? <LayoutGrid className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            <span className="ml-1.5 hidden md:inline">
              {showGrid ? "Less" : "More"}
            </span>
          </Button>
        </div>
        
        {showGrid && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
            {categoryNav.filter(cat => cat.id !== "all").map((category) => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                size="sm"
                className={`justify-start hover:bg-youbuy/10 hover:text-youbuy ${
                  selectedCategory === category.id ? "bg-youbuy/10 text-youbuy" : ""
                }`}
                onClick={() => {
                  handleCategoryClick(category.id);
                  setShowGrid(false);
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
