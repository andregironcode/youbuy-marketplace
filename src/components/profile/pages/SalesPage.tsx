
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { SellerAccountCard } from "@/components/profile/SellerAccountCard";

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
      
      const { data, error } = await supabase
        .from("seller_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data;
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
    <div className="flex-1 p-6">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold">Your Sales</h1>
        <p className="text-muted-foreground">
          Track your sold items and manage orders from buyers
        </p>
      </div>
      
      {user && (
        <SellerAccountCard 
          sellerAccount={sellerAccount}
          isLoading={loadingAccount}
        />
      )}
      
      <SalesHistory />
    </div>
  );
};
