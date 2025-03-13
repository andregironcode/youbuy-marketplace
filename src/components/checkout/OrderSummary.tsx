
import { ProductType } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";

interface OrderSummaryProps {
  product: ProductType;
}

export function OrderSummary({ product }: OrderSummaryProps) {
  // Calculate delivery fee based on price (just for demo purposes)
  const deliveryFee = product.price < 50 ? 10 : 0;
  const serviceCharge = product.price * 0.05; // 5% service charge
  const total = product.price + deliveryFee + serviceCharge;

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
            <p className="text-muted-foreground text-xs">{product.seller.name}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span>AED {product.price.toFixed(2)}</span>
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
            <span className="text-muted-foreground">Service Charge</span>
            <span>AED {serviceCharge.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs">
          <p className="text-muted-foreground">
            Same day delivery available for orders placed before 3pm. 
            Free delivery on orders over AED 50.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
