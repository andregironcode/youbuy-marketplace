import { cn } from "@/lib/utils";

interface ListingsTabsProps {
  currentActiveTab: "active" | "reserved" | "sold";
  onTabChange: (tab: "active" | "reserved" | "sold") => void;
}

export const ListingsTabs = ({ currentActiveTab, onTabChange }: ListingsTabsProps) => {
  return (
    <div className="flex justify-between items-center mb-4 border-b">
      <div className="flex">
        <button
          onClick={() => onTabChange("active")}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            currentActiveTab === "active"
              ? "text-youbuy border-b-2 border-youbuy"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ACTIVE
        </button>
        <button
          onClick={() => onTabChange("reserved")}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            currentActiveTab === "reserved"
              ? "text-youbuy border-b-2 border-youbuy"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          RESERVED
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
    </div>
  );
};
