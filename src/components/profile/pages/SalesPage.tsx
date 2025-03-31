import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { SellerAccountCard } from "@/components/profile/SellerAccountCard";
import { Button } from "@/components/ui/button";

export const SalesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const setupSuccess = searchParams.get('setup') === 'success';
  
  const { data: sellerAccount, isLoading: loadingAccount, refetch } = useQuery({
    queryKey: ["sellerAccount", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from("seller_accounts")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching seller account:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error in seller account query:", error);
        throw error;
      }
    },
    enabled: !!user,
  });
  
  useEffect(() => {
    if (setupSuccess) {
      refetch();
      toast({
        title: "Stripe setup complete",
        description: "Your payment account has been set up successfully.",
      });
    }
  }, [setupSuccess, refetch, toast]);

  return (
    <div className="flex-1 -mt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Your Sales</h1>
        <p className="text-muted-foreground">
          Track your sold items and manage orders from buyers
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-2">Seller Payment Account</h2>
          <p className="text-muted-foreground mb-4">
            Set up your payment account to start selling and receiving payments securely.
          </p>
          <Button variant="default" className="bg-youbuy hover:bg-youbuy/90 text-white">
            Set Up Payment Account
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Sales History</h2>
          <SalesHistory />
        </div>
      </div>
    </div>
  );
};
