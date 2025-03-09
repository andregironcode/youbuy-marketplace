
import { Card, CardContent } from "@/components/ui/card";

export const SellerInformation = () => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
      <p className="text-muted-foreground mb-4">
        Detailed information about this seller, including their selling preferences, 
        shipping options, and return policies.
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Shipping Options</h4>
          <p className="text-sm text-muted-foreground">
            This seller offers both local pickup and shipping services.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium">Return Policy</h4>
          <p className="text-sm text-muted-foreground">
            Returns accepted within 7 days of purchase.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium">Payment Methods</h4>
          <p className="text-sm text-muted-foreground">
            Cash, bank transfer, and in-app payments.
          </p>
        </div>
      </div>
    </div>
  );
};
