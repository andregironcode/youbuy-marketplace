
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = [
  { id: "all", name: "All" },
  { id: "electronics", name: "Electronics" },
  { id: "furniture", name: "Furniture" },
  { id: "clothing", name: "Clothing" },
  { id: "vehicles", name: "Vehicles" },
  { id: "property", name: "Property" },
  { id: "jobs", name: "Jobs" },
  { id: "services", name: "Services" },
  { id: "hobbies", name: "Hobbies" },
  { id: "sports", name: "Sports" },
];

interface CategoryNavProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const CategoryNav = ({ selectedCategory, setSelectedCategory }: CategoryNavProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="container py-4">
      <ScrollArea className="w-full" orientation="horizontal">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className={`w-full justify-start ${isMobile ? 'h-auto' : ''}`}>
            {categories.map((category) => (
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
      </ScrollArea>
    </div>
  );
};
