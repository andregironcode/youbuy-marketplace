
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  // Example category structure - in a real app you'd fetch this from your database
  const categories = [
    {
      id: "electronics",
      name: "Electronics",
      subcategories: [
        {
          id: "smartphones",
          name: "Smartphones",
          subSubcategories: [
            { id: "iphone", name: "iPhone" },
            { id: "android", name: "Android" },
          ],
        },
        {
          id: "computers",
          name: "Computers",
          subSubcategories: [
            { id: "laptops", name: "Laptops" },
            { id: "desktops", name: "Desktops" },
          ],
        },
      ],
    },
    {
      id: "clothing",
      name: "Clothing",
      subcategories: [
        {
          id: "mens",
          name: "Men's",
          subSubcategories: [
            { id: "shirts", name: "Shirts" },
            { id: "pants", name: "Pants" },
          ],
        },
        {
          id: "womens",
          name: "Women's",
          subSubcategories: [
            { id: "dresses", name: "Dresses" },
            { id: "shoes", name: "Shoes" },
          ],
        },
      ],
    },
  ];

  // Find the current category, subcategory, and subSubcategory
  const currentCategory = categories.find((cat) => cat.id === categoryId);
  const currentSubcategory = currentCategory?.subcategories.find(
    (subcat) => subcat.id === subcategoryId
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
              <AccordionTrigger
                className={`text-sm ${
                  category.id === categoryId ? "font-bold text-primary" : ""
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 flex flex-col space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id}>
                      <Button
                        variant={
                          subcategory.id === subcategoryId && category.id === categoryId
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className="w-full justify-start text-sm h-8"
                        onClick={() =>
                          onCategoryChange(category.id, subcategory.id)
                        }
                      >
                        {subcategory.name}
                      </Button>
                      {subcategory.id === subcategoryId &&
                        category.id === categoryId && (
                          <div className="pl-2 flex flex-col space-y-1 mt-1">
                            {subcategory.subSubcategories.map(
                              (subSubcategory) => (
                                <Button
                                  key={subSubcategory.id}
                                  variant={
                                    subSubcategory.id === subSubcategoryId
                                      ? "outline"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className="w-full justify-start text-xs h-7"
                                  onClick={() =>
                                    onCategoryChange(
                                      category.id,
                                      subcategory.id,
                                      subSubcategory.id
                                    )
                                  }
                                >
                                  {subSubcategory.name}
                                </Button>
                              )
                            )}
                          </div>
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
