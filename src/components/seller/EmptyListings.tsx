import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyListingsProps {
  activeTab: "active" | "reserved" | "sold";
  onAddProduct: () => void;
}

export const EmptyListings = ({ activeTab, onAddProduct }: EmptyListingsProps) => {
  const getTitle = () => {
    switch(activeTab) {
      case "active": return "No active products found";
      case "reserved": return "No reserved products found";
      case "sold": return "No sold products found";
      default: return "No products found";
    }
  };
  
  const getMessage = () => {
    switch(activeTab) {
      case "active": return "You don't have any active products listed at the moment.";
      case "reserved": return "You don't have any products marked as reserved.";
      case "sold": return "You don't have any sold products yet.";
      default: return "You don't have any products in this category.";
    }
  };

  return (
    <div className="rounded-lg bg-youbuy-light border border-youbuy/20 p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
        <Plus className="h-8 w-8 text-youbuy" />
      </div>
      <h3 className="text-lg font-medium mb-2">{getTitle()}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{getMessage()}</p>
      {activeTab === "active" && (
        <Button onClick={onAddProduct} className="bg-youbuy hover:bg-youbuy/90">
          Add product
        </Button>
      )}
    </div>
  );
};
