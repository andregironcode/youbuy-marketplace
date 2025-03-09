
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { categories } from "@/data/categories";

interface CategoryBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBrowser = ({ open, onOpenChange, onSelectCategory }: CategoryBrowserProps) => {
  const [currentLevel, setCurrentLevel] = useState<"main" | "sub" | "subsub">("main");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentLevel("sub");
  };
  
  const handleSubCategorySelect = (subCategoryId: string) => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return;
    
    const subCategory = category.subCategories.find(s => s.id === subCategoryId);
    if (!subCategory) return;
    
    if (subCategory.subSubCategories && subCategory.subSubCategories.length > 0) {
      setSelectedSubCategory(subCategoryId);
      setCurrentLevel("subsub");
    } else {
      // If no sub-subcategories, select this subcategory directly
      onSelectCategory(selectedCategory!);
      onOpenChange(false);
    }
  };
  
  const handleSubSubCategorySelect = (subSubCategoryId: string) => {
    onSelectCategory(selectedCategory!);
    onOpenChange(false);
  };
  
  const handleViewAll = () => {
    onSelectCategory("all");
    onOpenChange(false);
  };
  
  const handleBack = () => {
    if (currentLevel === "subsub") {
      setCurrentLevel("sub");
      setSelectedSubCategory(null);
    } else if (currentLevel === "sub") {
      setCurrentLevel("main");
      setSelectedCategory(null);
    }
  };

  const getCurrentContent = () => {
    if (currentLevel === "main") {
      return (
        <div className="flex flex-col space-y-0">
          <Button 
            variant="ghost" 
            className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-none border-b text-base font-normal"
            onClick={handleViewAll}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-800">View all</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
          
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant="ghost"
                className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-none border-b text-base font-normal"
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">{category.name}</span>
                </div>
                {category.subCategories.length > 0 && (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            );
          })}
        </div>
      );
    } else if (currentLevel === "sub" && selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) return null;
      
      return (
        <div className="flex flex-col space-y-0">
          <Button 
            variant="ghost" 
            className="flex items-center justify-start gap-2 py-4 px-2 hover:bg-gray-50 rounded-none border-b text-base font-normal"
            onClick={handleBack}
          >
            <ChevronRight className="h-5 w-5 text-gray-400 rotate-180" />
            <span>Back to categories</span>
          </Button>
          
          {category.subCategories.map((subCategory) => (
            <Button
              key={subCategory.id}
              variant="ghost"
              className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-none border-b text-base font-normal"
              onClick={() => handleSubCategorySelect(subCategory.id)}
            >
              <span className="text-gray-800">{subCategory.name}</span>
              {subCategory.subSubCategories && subCategory.subSubCategories.length > 0 && (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </Button>
          ))}
        </div>
      );
    } else if (currentLevel === "subsub" && selectedCategory && selectedSubCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) return null;
      
      const subCategory = category.subCategories.find(s => s.id === selectedSubCategory);
      if (!subCategory || !subCategory.subSubCategories) return null;
      
      return (
        <div className="flex flex-col space-y-0">
          <Button 
            variant="ghost" 
            className="flex items-center justify-start gap-2 py-4 px-2 hover:bg-gray-50 rounded-none border-b text-base font-normal"
            onClick={handleBack}
          >
            <ChevronRight className="h-5 w-5 text-gray-400 rotate-180" />
            <span>Back to {subCategory.name}</span>
          </Button>
          
          {subCategory.subSubCategories.map((subSubCategory) => (
            <Button
              key={subSubCategory.id}
              variant="ghost"
              className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-none border-b text-base font-normal"
              onClick={() => handleSubSubCategorySelect(subSubCategory.id)}
            >
              <span className="text-gray-800">{subSubCategory.name}</span>
            </Button>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center justify-between">
          <DialogTitle className="text-xl font-medium">Browse by category</DialogTitle>
          <DialogClose className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>
        <div className="px-2">
          {getCurrentContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
