
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { categoryNav } from "@/data/categories";

interface CategoryNavProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const CategoryNav = ({ selectedCategory, setSelectedCategory }: CategoryNavProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="container py-4">
      <ScrollArea className="w-full">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className={`w-full justify-start ${isMobile ? 'h-auto' : ''}`}>
            {categoryNav.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className={`px-4 py-2 ${isMobile ? 'text-sm' : ''}`}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
