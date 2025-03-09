
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CategorySelector } from "@/components/category/CategorySelector";
import { SellStep } from "@/types/sellForm";

interface CategoryStepProps {
  title: string;
  category: string;
  subcategory: string;
  subSubcategory: string;
  handleCategoryChange: (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => void;
  setCurrentStep: (step: SellStep) => void;
}

export const CategoryStep: React.FC<CategoryStepProps> = ({
  title,
  category,
  subcategory,
  subSubcategory,
  handleCategoryChange,
  setCurrentStep,
}) => {
  const isCategoryValid = category !== "";
  
  // Detect category based on title keywords
  const detectCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("phone") || lowerTitle.includes("iphone") || 
        lowerTitle.includes("samsung") || lowerTitle.includes("xiaomi") || 
        lowerTitle.includes("smartphone")) {
      return { category: "mobile", subcategory: "phones" };
    }
    
    if (lowerTitle.includes("laptop") || lowerTitle.includes("computer") || 
        lowerTitle.includes("pc") || lowerTitle.includes("desktop") || 
        lowerTitle.includes("macbook")) {
      return { category: "electronics", subcategory: "computers" };
    }
    
    if (lowerTitle.includes("sofa") || lowerTitle.includes("chair") || 
        lowerTitle.includes("table") || lowerTitle.includes("couch") || 
        lowerTitle.includes("desk")) {
      return { category: "furniture", subcategory: "living" };
    }
    
    if (lowerTitle.includes("tv") || lowerTitle.includes("television") || 
        lowerTitle.includes("lcd") || lowerTitle.includes("smart tv")) {
      return { category: "electronics", subcategory: "televisions" };
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Category</CardTitle>
        <CardDescription>
          Choose the most appropriate category for your item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Suggested categories</h3>
          <div className="space-y-2">
            {detectCategory(title) && detectCategory(title)?.category === "mobile" && (
              <button
                className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
                onClick={() => {
                  handleCategoryChange("mobile", "phones");
                  setCurrentStep("details");
                }}
              >
                <div className="mr-3 text-gray-500">📱</div>
                <div>
                  <div className="font-medium">Smartphones</div>
                  <div className="text-sm text-muted-foreground">Phones: mobiles & smartwatches</div>
                </div>
              </button>
            )}
            
            {detectCategory(title) && detectCategory(title)?.category === "electronics" && detectCategory(title)?.subcategory === "computers" && (
              <button
                className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
                onClick={() => {
                  handleCategoryChange("electronics", "computers");
                  setCurrentStep("details");
                }}
              >
                <div className="mr-3 text-gray-500">💻</div>
                <div>
                  <div className="font-medium">Laptops & Computers</div>
                  <div className="text-sm text-muted-foreground">Electronics & technology</div>
                </div>
              </button>
            )}
            
            {detectCategory(title) && detectCategory(title)?.category === "furniture" && (
              <button
                className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
                onClick={() => {
                  handleCategoryChange("furniture", "living");
                  setCurrentStep("details");
                }}
              >
                <div className="mr-3 text-gray-500">🪑</div>
                <div>
                  <div className="font-medium">Furniture</div>
                  <div className="text-sm text-muted-foreground">Home & garden</div>
                </div>
              </button>
            )}
            
            {detectCategory(title) && detectCategory(title)?.category === "electronics" && detectCategory(title)?.subcategory === "televisions" && (
              <button
                className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
                onClick={() => {
                  handleCategoryChange("electronics", "televisions");
                  setCurrentStep("details");
                }}
              >
                <div className="mr-3 text-gray-500">📺</div>
                <div>
                  <div className="font-medium">Televisions</div>
                  <div className="text-sm text-muted-foreground">Electronics & technology</div>
                </div>
              </button>
            )}
            
            {!detectCategory(title) && (
              <div className="text-center p-4 text-sm text-muted-foreground">
                No suggested categories based on your title. Please select from the categories below.
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Or select from all categories</h3>
          <CategorySelector 
            onCategoryChange={handleCategoryChange}
            selectedCategory={category}
            selectedSubcategory={subcategory}
            selectedSubSubcategory={subSubcategory}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("title")}
        >
          Back
        </Button>
        <Button 
          disabled={!isCategoryValid} 
          onClick={() => setCurrentStep("details")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
