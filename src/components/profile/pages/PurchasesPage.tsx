import { PurchaseHistory } from "@/components/purchases/PurchaseHistory";

export const PurchasesPage = () => {
  return (
    <div className="flex-1 -mt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Your Purchases</h1>
        <p className="text-muted-foreground">
          Track your order history and view details of items you've bought
        </p>
      </div>

      <div className="space-y-4">
        <PurchaseHistory />
      </div>
    </div>
  );
};
