import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categories } from "@/data/categories";

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

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible defaultValue={categoryId}>
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-sm">
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {category.subCategories.map((subCategory) => (
                    <div key={subCategory.id} className="ml-4">
                      {subCategory.subSubCategories ? (
                        <Accordion type="single" collapsible defaultValue={subcategoryId}>
                          <AccordionItem value={subCategory.id} className="border-none">
                            <AccordionTrigger className="text-sm py-1">
                              {subCategory.name}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 ml-4">
                                {subCategory.subSubCategories.map((subSubCategory) => (
                                  <Button
                                    key={subSubCategory.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-sm ${
                                      subSubcategoryId === subSubCategory.id
                                        ? "text-youbuy"
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
                                    {subSubCategory.name}
                                  </Button>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-sm ${
                            subcategoryId === subCategory.id
                              ? "text-youbuy"
                              : "text-muted-foreground"
                          }`}
                          onClick={() =>
                            onCategoryChange(category.id, subCategory.id)
                          }
                        >
                          {subCategory.name}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
