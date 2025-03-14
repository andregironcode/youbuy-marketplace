
import { PurchaseHistory } from "@/components/purchases/PurchaseHistory";

export const PurchasesPage = () => {
  return (
    <div className="h-full p-6 overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Purchases</h1>
        <p className="text-muted-foreground">
          Track your order history and view details of items you've bought
        </p>
      </div>
      <div className="h-[calc(100%-100px)] overflow-auto">
        <PurchaseHistory />
      </div>
    </div>
  );
};
