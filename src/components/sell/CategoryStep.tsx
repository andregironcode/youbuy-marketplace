
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
            <button
              className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
              onClick={() => {
                if (title.toLowerCase().includes("phone") || title.toLowerCase().includes("iphone")) {
                  handleCategoryChange("mobile", "phones");
                  setCurrentStep("details");
                }
              }}
            >
              <div className="mr-3 text-gray-500">📱</div>
              <div>
                <div className="font-medium">Smartphones</div>
                <div className="text-sm text-muted-foreground">Phones: mobiles & smartwatches</div>
              </div>
            </button>
            <button
              className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
              onClick={() => {
                if (title.toLowerCase().includes("laptop") || title.toLowerCase().includes("computer")) {
                  handleCategoryChange("electronics", "computers");
                  setCurrentStep("details");
                }
              }}
            >
              <div className="mr-3 text-gray-500">💻</div>
              <div>
                <div className="font-medium">Laptops & Computers</div>
                <div className="text-sm text-muted-foreground">Electronics & technology</div>
              </div>
            </button>
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
