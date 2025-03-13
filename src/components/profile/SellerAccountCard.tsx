
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SellerAccountCardProps {
  sellerAccount: any;
  isLoading: boolean;
}

export const SellerAccountCard = ({ sellerAccount, isLoading }: SellerAccountCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleCreateSellerAccount = async () => {
    if (!user) return;
    
    try {
      const { data: userData } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .single();
      
      const response = await supabase.functions.invoke('stripe-payment/create-connect-account', {
        body: {
          userId: user.id,
          email: user.email,
          name: userData?.full_name || userData?.username || "Seller",
        }
      });
      
      if (response.error) throw new Error(response.error);
      
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating seller account:", error);
      toast({
        title: "Error",
        description: "Could not set up your payment account. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateSellerAccount = async () => {
    if (!user || !sellerAccount?.stripe_account_id) return;
    
    try {
      const response = await supabase.functions.invoke('stripe-payment/create-connect-account', {
        body: {
          userId: user.id,
          email: user.email,
        }
      });
      
      if (response.error) throw new Error(response.error);
      
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error updating seller account:", error);
      toast({
        title: "Error",
        description: "Could not access your payment account. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-left">
          <CreditCard className="mr-2 h-5 w-5" />
          Seller Payment Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-left">Loading account information...</p>
        ) : sellerAccount ? (
          <div className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Stripe Connect Account</p>
                <p className="text-sm text-muted-foreground">
                  Status: {sellerAccount.charges_enabled ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-amber-600">Setup needed</span>
                  )}
                </p>
              </div>
              <Button onClick={handleUpdateSellerAccount}>
                {sellerAccount.charges_enabled ? "Manage Account" : "Complete Setup"}
              </Button>
            </div>
            
            {!sellerAccount.charges_enabled && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  You need to complete your Stripe account setup to receive payments for your sales.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-left">
            <p className="mb-4">
              Set up your payment account to start selling and receiving payments securely.
            </p>
            <Button onClick={handleCreateSellerAccount}>
              Set Up Payment Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
