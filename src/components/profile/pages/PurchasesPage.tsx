
import { PurchaseHistory } from "@/components/purchases/PurchaseHistory";

export const PurchasesPage = () => {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold">Your Purchases</h1>
        <p className="text-muted-foreground">
          Track your order history and view details of items you've bought
        </p>
      </div>
      <PurchaseHistory />
    </div>
  );
};
