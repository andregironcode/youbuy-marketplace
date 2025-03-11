
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyListingsProps {
  activeTab: "selling" | "sold";
  onAddProduct: () => void;
}

export const EmptyListings = ({ activeTab, onAddProduct }: EmptyListingsProps) => {
  return (
    <div className="rounded-lg bg-youbuy-light border border-youbuy/20 p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
        <Plus className="h-8 w-8 text-youbuy" />
      </div>
      <h3 className="text-lg font-medium mb-2">No {activeTab === "sold" ? "sold" : ""} products found</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {activeTab === "selling" 
          ? "You don't have any products listed at the moment." 
          : "You don't have any sold products yet."}
      </p>
      {activeTab === "selling" && (
        <Button onClick={onAddProduct} className="bg-youbuy hover:bg-youbuy/90">
          Add product
        </Button>
      )}
    </div>
  );
};
