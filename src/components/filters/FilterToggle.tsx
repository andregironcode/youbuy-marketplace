
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterToggleProps {
  onClick: () => void;
  activeFiltersCount?: number;
}

export const FilterToggle = ({ onClick, activeFiltersCount = 0 }: FilterToggleProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <Filter className="h-4 w-4" />
      <span>Filters</span>
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
      )}
    </Button>
  );
};
