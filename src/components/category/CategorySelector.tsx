
import { useState, useEffect } from "react";
import { categories } from "@/data/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CategorySelectorProps {
  onCategoryChange: (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
  selectedSubSubcategory?: string;
}

export const CategorySelector = ({
  onCategoryChange,
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory
}: CategorySelectorProps) => {
  const [currentCategory, setCurrentCategory] = useState(selectedCategory || "");
  const [currentSubcategory, setCurrentSubcategory] = useState(selectedSubcategory || "");
  const [currentSubSubcategory, setCurrentSubSubcategory] = useState(selectedSubSubcategory || "");
  
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subSubcategories, setSubSubcategories] = useState<any[]>([]);

  // Update subcategories when category changes
  useEffect(() => {
    if (currentCategory) {
      const category = categories.find(c => c.id === currentCategory);
      if (category) {
        setSubcategories(category.subCategories);
        setCurrentSubcategory("");
        setCurrentSubSubcategory("");
        setSubSubcategories([]);
      }
    } else {
      setSubcategories([]);
      setCurrentSubcategory("");
      setCurrentSubSubcategory("");
      setSubSubcategories([]);
    }
  }, [currentCategory]);

  // Update sub-subcategories when subcategory changes
  useEffect(() => {
    if (currentSubcategory) {
      const category = categories.find(c => c.id === currentCategory);
      if (category) {
        const subcategory = category.subCategories.find(s => s.id === currentSubcategory);
        if (subcategory && subcategory.subSubCategories) {
          setSubSubcategories(subcategory.subSubCategories);
        } else {
          setSubSubcategories([]);
        }
        setCurrentSubSubcategory("");
      }
    } else {
      setSubSubcategories([]);
      setCurrentSubSubcategory("");
    }
  }, [currentSubcategory, currentCategory]);

  // Call the parent callback when selections change
  useEffect(() => {
    onCategoryChange(currentCategory, currentSubcategory, currentSubSubcategory);
  }, [currentCategory, currentSubcategory, currentSubSubcategory, onCategoryChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Main Category</Label>
        <Select value={currentCategory} onValueChange={setCurrentCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subcategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select value={currentSubcategory} onValueChange={setCurrentSubcategory}>
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {subSubcategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="subSubcategory">Specific Type</Label>
          <Select value={currentSubSubcategory} onValueChange={setCurrentSubSubcategory}>
            <SelectTrigger id="subSubcategory">
              <SelectValue placeholder="Select a specific type" />
            </SelectTrigger>
            <SelectContent>
              {subSubcategories.map((subSubcategory) => (
                <SelectItem key={subSubcategory.id} value={subSubcategory.id}>
                  {subSubcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
