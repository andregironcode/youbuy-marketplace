import { ProductType } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Shield, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OrderSummaryProps {
  product?: ProductType;
}

export function OrderSummary({ product }: OrderSummaryProps) {
  // Fetch platform fee from the database
  const { data: platformFeeData } = useQuery({
    queryKey: ["platformFees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_fees")
        .select("*")
        .eq("active", true)
        .limit(1)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  // If product is not loaded yet, show loading state
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Calculate fees based on price
  const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const deliveryFee = productPrice < 50 ? 10 : 0;
  const feePercentage = platformFeeData?.fee_percentage || 5.0;
  const minimumFee = platformFeeData?.minimum_fee || 1.0;
  
  // Calculate service fee (platform fee)
  const serviceCharge = Math.max(
    productPrice * (feePercentage / 100),
    minimumFee
  );
  
  const total = productPrice + deliveryFee + serviceCharge;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={product.images?.[0] || product.image} 
              alt={product.title} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
            <p className="text-muted-foreground text-xs">{product.seller?.name}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span>AED {productPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>
              {deliveryFee > 0 
                ? `AED ${deliveryFee.toFixed(2)}` 
                : <span className="text-green-600">Free</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee ({feePercentage}%)</span>
            <span>AED {serviceCharge.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs space-y-2">
          <div className="flex items-start">
            <Shield className="h-4 w-4 text-youbuy mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Buyer Protection</p>
              <p className="text-muted-foreground">
                Your payment is held securely until you confirm receipt of the item.
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Free delivery on orders over AED 50.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
