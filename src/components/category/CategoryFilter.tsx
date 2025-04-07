import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categories } from "@/data/categories";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

// Import custom styles
import "./category-filter.css";

interface CategoryFilterProps {
  categoryId?: string;
  subcategoryId?: string;
  subSubcategoryId?: string;
  onCategoryChange: (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categoryId,
  subcategoryId,
  subSubcategoryId,
  onCategoryChange,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [sortedCategories, setSortedCategories] = useState(categories);
  
  // Find the current category, subcategory, and subSubcategory
  const currentCategory = categories.find((cat) => cat.id === categoryId);
  const currentSubcategory = currentCategory?.subCategories.find(
    (subcat) => subcat.id === subcategoryId
  );
  const currentSubSubcategory = currentSubcategory?.subSubCategories?.find(
    (subsubcat) => subsubcat.id === subSubcategoryId
  );

  // Sort categories to prioritize the selected category
  useEffect(() => {
    if (categoryId) {
      const sorted = [...categories].sort((a, b) => {
        if (a.id === categoryId) return -1;
        if (b.id === categoryId) return 1;
        return 0;
      });
      setSortedCategories(sorted);
    } else {
      setSortedCategories(categories);
    }
  }, [categoryId]);

  // Calculate which categories to display
  const displayCategories = showAllCategories 
    ? sortedCategories 
    : sortedCategories.slice(0, 4);

  // Make all categories have the same behavior
  const defaultAccordionValue = categoryId ? [categoryId] : [];

  return (
    <Card className="mb-4 shadow-sm border-neutral-100">
      <CardHeader className="pb-2 pt-3 bg-green-50">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-5 w-5 text-green-500" />
          <span className="text-green-500 font-medium">Filter Categories</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-0 pb-3">
        <Accordion type="multiple" defaultValue={defaultAccordionValue} className="accordion-no-underline">
          {displayCategories.map((category) => (
            <AccordionItem 
              key={category.id} 
              value={category.id} 
              className={`border-b-0 ${category.id === categoryId ? 'active-category' : 'category-item'}`}
            >
              <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline">
                <span className={`line-clamp-1 text-left w-full ${category.id === categoryId ? "text-green-500" : ""}`}>
                  {category.name}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <ul className="list-none space-y-0 subcategory-list">
                  {category.subCategories.map((subCategory) => (
                    <li key={subCategory.id} className="pl-5">
                      {subCategory.subSubCategories ? (
                        <Accordion type="single" collapsible className="accordion-no-underline">
                          <AccordionItem value="item-1" className="border-0">
                            <AccordionTrigger className="p-0 h-auto py-2 text-sm">
                              <span 
                                className={`text-sm font-normal px-0 line-clamp-1 text-left ${
                                  subcategoryId === subCategory.id ? "text-green-500" : "text-foreground"
                                }`}
                              >
                                {subCategory.name}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-1 pl-4">
                              <ul className="list-none space-y-0 subsub-list">
                                {subCategory.subSubCategories.map((subSubCategory) => (
                                  <li key={subSubCategory.id}>
                                    <Button
                                      variant="ghost"
                                      className={`w-full justify-start text-xs min-h-7 h-auto px-0 py-1.5 ${
                                        subSubcategoryId === subSubCategory.id
                                          ? "text-green-500"
                                          : "text-muted-foreground"
                                      }`}
                                      onClick={() =>
                                        onCategoryChange(
                                          category.id,
                                          subCategory.id,
                                          subSubCategory.id
                                        )
                                      }
                                    >
                                      <span className="line-clamp-2 text-left">{subSubCategory.name}</span>
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <div className={`w-full text-sm py-2 px-0 font-normal ${
                          subcategoryId === subCategory.id
                            ? "text-green-500"
                            : "text-foreground"
                        }`}>
                          <span className="line-clamp-2 text-left">{subCategory.name}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="px-3">
          {categories.length > 4 && (
            <button 
              className="see-more-button"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? 'Show Less' : 'See More Categories'}
              {showAllCategories ? <ChevronUp className="ml-1" /> : <ChevronDown className="ml-1" />}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
