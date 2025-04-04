import { PurchaseHistory } from "@/components/purchases/PurchaseHistory";
import { PageHeader } from "../PageHeader";

export const PurchasesPage = () => {
  return (
    <>
      <PageHeader
        title="Your Purchases"
        description="Track your order history and view details of items you've bought"
      />

      <div className="space-y-4">
        <PurchaseHistory />
      </div>
    </>
  );
};
