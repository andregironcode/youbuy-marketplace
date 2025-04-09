import { ProductType } from "@/types/product";
import { Button } from "../ui/button";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, Timer, CheckCircle } from "lucide-react";
import { MessageButton } from "../product/MessageButton";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { ReserveProductDialog } from "../product/ReserveProductDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ListingItemProps {
  product: ProductType;
  showBuyButtons?: boolean;
  onProductUpdated?: () => void;
}

export const ListingItem = ({ 
  product, 
  showBuyButtons = true,
  onProductUpdated 
}: ListingItemProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isOwnProduct = user?.id === product.seller?.id;
  const isAvailable = product.product_status === "available" || !product.product_status;
  const isReserved = product.product_status === "reserved";
  const isSold = product.product_status === "sold";

  const handleProductUpdated = () => {
    if (onProductUpdated) {
      onProductUpdated();
    }
  };

  const handleCancelReservation = async () => {
    if (!user || !product.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          product_status: 'available',
          reserved_user_id: null,
          reservation_days: null
        })
        .eq('id', product.id);
      
      if (error) throw error;
      
      toast({
        title: "Reservation Cancelled",
        description: "Product is now available for purchase.",
      });
      
      handleProductUpdated();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-4 border rounded-lg p-4 bg-white hover:bg-gray-50/50 transition-colors">
      <Link to={`/product/${product.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
        <img 
          src={product.image_urls?.[0] || '/placeholder.svg'} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
        {product.product_status && product.product_status !== "available" && (
          <div className="absolute top-1 left-1">
            {isReserved && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                Reserved
              </Badge>
            )}
            {isSold && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                Sold
              </Badge>
            )}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link to={`/product/${product.id}`} className="font-medium hover:text-youbuy transition-colors line-clamp-1">
                {product.title}
              </Link>
              <p className="text-price font-semibold text-lg">€{formatCurrency(product.price)}</p>
              {isReserved && product.reservedFor && (
                <p className="text-xs text-amber-600 flex items-center">
                  <Timer className="h-3 w-3 mr-1" />
                  Reserved for {product.reservedFor}
                </p>
              )}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              <p>Listed {product.timeAgo}</p>
              {isOwnProduct && (
                <Link 
                  to={`/profile/edit-product/${product.id}`} 
                  className="text-youbuy hover:underline mt-1 block"
                >
                  Edit Listing
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-end">
            {showBuyButtons && !isOwnProduct && isAvailable && (
              <>
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => navigate(`/checkout/${product.id}`)}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Buy Now
                </Button>
                <MessageButton 
                  product={product} 
                  size="sm" 
                  variant="outline" 
                />
              </>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              View Details
            </Button>
            
            {isOwnProduct && (
              <>
                <Button 
                  size="sm" 
                  className="bg-youbuy hover:bg-youbuy/90 text-white"
                  onClick={() => navigate(`/profile/edit-product/${product.id}`)}
                >
                  Edit Listing
                </Button>
                
                {isAvailable && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setIsReserveDialogOpen(true)}
                    disabled={isLoading}
                  >
                    <Timer className="mr-1 h-4 w-4" />
                    Reserve
                  </Button>
                )}
                
                {isReserved && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleCancelReservation}
                    disabled={isLoading}
                  >
                    Cancel Reservation
                  </Button>
                )}
                
                {isSold && (
                  <Button 
                    size="sm" 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Sold
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {isReserveDialogOpen && (
        <ReserveProductDialog 
          product={product}
          isOpen={isReserveDialogOpen}
          onClose={() => setIsReserveDialogOpen(false)}
          onReserved={handleProductUpdated}
        />
      )}
    </div>
  );
};
