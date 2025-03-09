
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { categoryNav } from "@/data/categories";
import { Filter, Grid, LayoutGrid } from "lucide-react";
import { useState } from "react";

interface CategoryNavProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const CategoryNav = ({ selectedCategory, setSelectedCategory }: CategoryNavProps) => {
  const isMobile = useIsMobile();
  const [showGrid, setShowGrid] = useState(false);
  
  // Only show main categories in the top navigation bar (limited number)
  const mainCategories = categoryNav.slice(0, isMobile ? 4 : 7);
  
  return (
    <div className="border-b">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="bg-background border rounded-lg p-1 flex-nowrap w-max min-w-full md:w-auto">
                <TabsTrigger 
                  key="all"
                  value="all"
                  className="rounded-md data-[state=active]:bg-youbuy/10 data-[state=active]:text-youbuy"
                >
                  All Categories
                </TabsTrigger>
                {mainCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="rounded-md data-[state=active]:bg-youbuy/10 data-[state=active]:text-youbuy"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="ml-3 shrink-0 border-youbuy/20 hover:bg-youbuy/10 hover:text-youbuy"
          >
            {showGrid ? <LayoutGrid className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            <span className="ml-1.5 hidden md:inline">
              {showGrid ? "Less" : "More"}
            </span>
          </Button>
        </div>
        
        {showGrid && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 max-h-[50vh] overflow-y-auto pr-1">
            {categoryNav.filter(cat => cat.id !== "all").map((category) => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                size="sm"
                className={`justify-start hover:bg-youbuy/10 hover:text-youbuy ${
                  selectedCategory === category.id ? "bg-youbuy/10 text-youbuy" : ""
                }`}
                onClick={() => {
                  setSelectedCategory(category.id);
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
