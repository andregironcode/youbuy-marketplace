import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { SellerAccountCard } from "@/components/profile/SellerAccountCard";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <>
      <PageHeader
        title="Your Sales"
        description="Track your sold items and manage orders from buyers"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seller Payment Account</CardTitle>
            <CardDescription>
              Set up your payment account to start selling and receiving payments securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SellerAccountCard 
              sellerAccount={sellerAccount} 
              isLoading={loadingAccount} 
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold"></h2>
          <SalesHistory />
        </div>
      </div>
    </>
  );
};
