import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SortFilterProps {
  sortOrder: string;
  onSortChange: (sortOrder: string) => void;
}

export const SortFilter: React.FC<SortFilterProps> = ({
  sortOrder,
  onSortChange,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sort By</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <RadioGroup
          value={sortOrder}
          onValueChange={onSortChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="newest" />
            <Label htmlFor="newest" className="cursor-pointer">
              Newest first
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-asc" id="price-asc" />
            <Label htmlFor="price-asc" className="cursor-pointer">
              Price: Low to high
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-desc" id="price-desc" />
            <Label htmlFor="price-desc" className="cursor-pointer">
              Price: High to low
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
