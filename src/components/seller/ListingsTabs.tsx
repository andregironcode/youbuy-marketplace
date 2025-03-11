
import { Button } from "../ui/button";
import { ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingsTabsProps {
  currentActiveTab: "selling" | "sold";
  onTabChange: (tab: "selling" | "sold") => void;
}

export const ListingsTabs = ({ currentActiveTab, onTabChange }: ListingsTabsProps) => {
  return (
    <div className="flex justify-between items-center mb-4 border-b">
      <div className="flex">
        <button
          onClick={() => onTabChange("selling")}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            currentActiveTab === "selling"
              ? "text-youbuy border-b-2 border-youbuy"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          SELLING
        </button>
        <button
          onClick={() => onTabChange("sold")}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            currentActiveTab === "sold"
              ? "text-youbuy border-b-2 border-youbuy"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          SOLD
        </button>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-gray-600 gap-2"
      >
        <ListFilter className="h-4 w-4" />
        Filter
      </Button>
    </div>
  );
};
