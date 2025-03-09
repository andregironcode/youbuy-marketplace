
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { categoryNav } from "@/data/categories";
import { Grid, LayoutGrid } from "lucide-react";
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
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full overflow-hidden">
            <TabsList className="w-full flex flex-wrap gap-1">
              <TabsTrigger 
                key="all"
                value="all"
                className={`px-3 py-2 ${isMobile ? 'text-sm' : ''}`}
              >
                All Categories
              </TabsTrigger>
              {mainCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className={`px-3 py-2 ${isMobile ? 'text-sm' : ''}`}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="ml-2 shrink-0"
          >
            {showGrid ? <LayoutGrid className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            <span className="ml-1 hidden md:inline">
              {showGrid ? "Collapse" : "Browse All"}
            </span>
          </Button>
        </div>
        
        {showGrid && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {categoryNav.map((category) => (
              <Button 
                key={category.id}
                variant="ghost"
                size="sm"
                className="justify-start"
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
