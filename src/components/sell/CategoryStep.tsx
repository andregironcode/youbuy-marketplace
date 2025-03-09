
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
  
  // Function to detect category based on title keywords
  const detectCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("phone") || lowerTitle.includes("iphone") || 
        lowerTitle.includes("samsung") || lowerTitle.includes("xiaomi") || 
        lowerTitle.includes("smartphone") || lowerTitle.includes("mobile") ||
        lowerTitle.includes("android") || lowerTitle.includes("apple")) {
      return { category: "mobile", subcategory: "phones" };
    }
    
    if (lowerTitle.includes("laptop") || lowerTitle.includes("computer") || 
        lowerTitle.includes("pc") || lowerTitle.includes("desktop") || 
        lowerTitle.includes("macbook") || lowerTitle.includes("dell") ||
        lowerTitle.includes("hp") || lowerTitle.includes("lenovo") ||
        lowerTitle.includes("asus")) {
      return { category: "electronics", subcategory: "computers" };
    }
    
    if (lowerTitle.includes("sofa") || lowerTitle.includes("chair") || 
        lowerTitle.includes("table") || lowerTitle.includes("couch") || 
        lowerTitle.includes("desk") || lowerTitle.includes("bed") ||
        lowerTitle.includes("furniture") || lowerTitle.includes("dresser") ||
        lowerTitle.includes("cabinet")) {
      return { category: "furniture", subcategory: "living" };
    }
    
    if (lowerTitle.includes("tv") || lowerTitle.includes("television") || 
        lowerTitle.includes("lcd") || lowerTitle.includes("smart tv") ||
        lowerTitle.includes("led tv") || lowerTitle.includes("screen")) {
      return { category: "electronics", subcategory: "televisions" };
    }
    
    if (lowerTitle.includes("car") || lowerTitle.includes("vehicle") ||
        lowerTitle.includes("auto") || lowerTitle.includes("bmw") ||
        lowerTitle.includes("toyota") || lowerTitle.includes("honda") ||
        lowerTitle.includes("ford") || lowerTitle.includes("mercedes")) {
      return { category: "automotive", subcategory: "cars" };
    }
    
    if (lowerTitle.includes("shoes") || lowerTitle.includes("sneakers") ||
        lowerTitle.includes("boots") || lowerTitle.includes("nike") ||
        lowerTitle.includes("adidas") || lowerTitle.includes("puma") ||
        lowerTitle.includes("footwear")) {
      return { category: "fashion", subcategory: "shoes" };
    }
    
    if (lowerTitle.includes("shirt") || lowerTitle.includes("t-shirt") ||
        lowerTitle.includes("dress") || lowerTitle.includes("pants") ||
        lowerTitle.includes("jacket") || lowerTitle.includes("clothing") ||
        lowerTitle.includes("jeans") || lowerTitle.includes("wear")) {
      return { category: "fashion", subcategory: "clothing" };
    }
    
    return null;
  };

  // Detect suggested category based on title
  const suggestedCategory = detectCategory(title);

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
            {suggestedCategory && (
              <button
                className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
                onClick={() => {
                  handleCategoryChange(suggestedCategory.category, suggestedCategory.subcategory);
                  setCurrentStep("details");
                }}
              >
                <div className="mr-3 text-gray-500">
                  {suggestedCategory.category === "mobile" && "📱"}
                  {suggestedCategory.category === "electronics" && suggestedCategory.subcategory === "computers" && "💻"}
                  {suggestedCategory.category === "electronics" && suggestedCategory.subcategory === "televisions" && "📺"}
                  {suggestedCategory.category === "furniture" && "🪑"}
                  {suggestedCategory.category === "automotive" && "🚗"}
                  {suggestedCategory.category === "fashion" && "👕"}
                </div>
                <div>
                  <div className="font-medium">
                    {suggestedCategory.category === "mobile" && "Smartphones"}
                    {suggestedCategory.category === "electronics" && suggestedCategory.subcategory === "computers" && "Laptops & Computers"}
                    {suggestedCategory.category === "electronics" && suggestedCategory.subcategory === "televisions" && "Televisions"}
                    {suggestedCategory.category === "furniture" && "Furniture"}
                    {suggestedCategory.category === "automotive" && "Cars & Vehicles"}
                    {suggestedCategory.category === "fashion" && suggestedCategory.subcategory === "shoes" && "Shoes & Footwear"}
                    {suggestedCategory.category === "fashion" && suggestedCategory.subcategory === "clothing" && "Clothing & Apparel"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {suggestedCategory.category === "mobile" && "Phones: mobiles & smartwatches"}
                    {suggestedCategory.category === "electronics" && "Electronics & technology"}
                    {suggestedCategory.category === "furniture" && "Home & garden"}
                    {suggestedCategory.category === "automotive" && "Cars, motorcycles & vehicles"}
                    {suggestedCategory.category === "fashion" && "Fashion & accessories"}
                  </div>
                </div>
              </button>
            )}
            
            {!suggestedCategory && (
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
