import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "../PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SellerListings } from "@/components/seller/SellerListings";

export const ProductsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "reserved" | "sold">("active");
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Your Products"
        description="Manage your listings, create new ones, and activate featured products to sell faster"
      >
        <Button
          className="bg-youbuy hover:bg-youbuy/90 text-white"
          onClick={() => setCreating(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </PageHeader>

      {creating && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">Creating your products, please wait...</p>
        </div>
      )}

      <SellerListings 
        userId={user?.id} 
        activeTab={activeTab}
        showTabs={true}
        onTabChange={setActiveTab}
      />
    </>
  );
};
