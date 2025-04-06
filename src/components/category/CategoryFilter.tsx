import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categories } from "@/data/categories";
import { ChevronDown } from "lucide-react";

// Add custom styles to remove underline from AccordionTrigger
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
  // Find the current category, subcategory, and subSubcategory
  const currentCategory = categories.find((cat) => cat.id === categoryId);
  const currentSubcategory = currentCategory?.subCategories.find(
    (subcat) => subcat.id === subcategoryId
  );
  const currentSubSubcategory = currentSubcategory?.subSubCategories?.find(
    (subsubcat) => subsubcat.id === subSubcategoryId
  );

  // Make all categories have the same behavior
  const defaultAccordionValue = categoryId ? [categoryId] : [];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" defaultValue={defaultAccordionValue} className="accordion-no-underline">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-base font-medium">
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-none pl-0 space-y-3">
                  {category.subCategories.map((subCategory) => (
                    <li key={subCategory.id} className="ml-4">
                      {subCategory.subSubCategories ? (
                        <Accordion type="single" collapsible className="accordion-no-underline">
                          <AccordionItem value="item-1" className="border-0">
                            <AccordionTrigger className="p-0 h-auto">
                              <Button
                                variant="ghost"
                                className={`w-full justify-start text-base min-h-9 px-4 font-normal text-left ${
                                  subcategoryId === subCategory.id
                                    ? "text-primary bg-primary-foreground"
                                    : "text-foreground"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent accordion from toggling
                                  onCategoryChange(category.id, subCategory.id);
                                }}
                              >
                                <span className="line-clamp-2">{subCategory.name}</span>
                              </Button>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-0">
                              <ul className="list-none pl-4 space-y-3">
                                {subCategory.subSubCategories.map((subSubCategory) => (
                                  <li key={subSubCategory.id}>
                                    <Button
                                      variant="ghost"
                                      className={`w-full justify-start text-sm min-h-9 px-4 ${
                                        subSubcategoryId === subSubCategory.id
                                          ? "text-primary bg-primary-foreground"
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
                                      <span className="line-clamp-2">{subSubCategory.name}</span>
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-base min-h-9 px-4 font-normal ${
                            subcategoryId === subCategory.id
                              ? "text-primary bg-primary-foreground"
                              : "text-foreground"
                          }`}
                          onClick={() =>
                            onCategoryChange(category.id, subCategory.id)
                          }
                        >
                          <span className="line-clamp-2">{subCategory.name}</span>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
